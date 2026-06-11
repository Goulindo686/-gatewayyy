export const dynamic = 'force-dynamic';
// Last update: 2026-02-25 10:59

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';
import { PagarmeService } from '@/lib/pagarme';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Não autorizado', 401);

    const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('id', auth.user.id);

    return jsonSuccess({ user: users?.[0] });
}

const BANK_CODES: Record<string, string> = {
    'nubank': '260', 'inter': '077', 'bradesco': '237', 'itau': '341', 'santander': '033',
    'caixa': '104', 'banco do brasil': '001', 'bb': '001', 'pagbank': '290', 'pagseguro': '290',
    'mercado pago': '323', 'c6': '336', 'picpay': '380', 'btg': '208',
};

function getRecipientStatus(recipient: any, fallback = 'pending') {
    const raw = String(recipient?.status || recipient?.registration_status || fallback || 'pending').toLowerCase();
    if (['active', 'pending', 'refused', 'suspended'].includes(raw)) return raw;
    if (['rejected', 'denied', 'failed'].includes(raw)) return 'refused';
    return fallback;
}

function getPagarmeErrorMessage(error: any) {
    const data = error?.response?.data;
    if (!data) return error?.message || 'Erro ao sincronizar recebedor';
    if (typeof data.message === 'string') return data.message;
    if (data.errors && typeof data.errors === 'object') {
        return Object.entries(data.errors)
            .map(([field, messages]: any) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
            .join('; ');
    }
    return error?.message || 'Erro ao sincronizar recebedor';
}

export async function PUT(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Não autorizado', 401);

    try {
        // Fetch old user to detect changes in critical fields (like document) without .single()
        const { data: usersOld } = await supabase
            .from('users')
            .select('cpf_cnpj, id')
            .eq('id', auth.user.id);

        const oldUser = usersOld?.[0];

        const body = await req.json();
        const allowedFields = [
            'name', 'phone', 'cpf_cnpj',
            'address_street', 'address_number', 'address_complement',
            'address_neighborhood', 'address_city', 'address_state', 'address_zipcode',
            'pix_key', 'pix_key_type',
            'bank_name', 'bank_agency', 'bank_agency_digit', 'bank_account', 'bank_account_digit', 'bank_account_type',
            'store_name', 'store_slug', 'store_description', 'store_active',
            'store_theme', 'store_banner_url', 'store_template', 'store_accent_color',
            'store_headline', 'store_cta_text', 'store_badge_text',
            'webhook_url'
        ];

        const updateData: any = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                // Handle document strings: trim and convert empty to null
                if (field === 'cpf_cnpj') {
                    const value = typeof body[field] === 'string' ? body[field].trim() : body[field];
                    updateData[field] = value === '' ? null : value;
                } else if (field === 'store_badge_text') {
                    updateData[field] = typeof body[field] === 'string' ? body[field].trim().slice(0, 60) : body[field];
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        console.log(`[AUTH API] Attempting to update profile for user ID: ${auth.user.id}`);
        console.log(`[AUTH API] Data to update:`, JSON.stringify(updateData));

        if (Object.keys(updateData).length === 0) {
            return jsonError('Nenhum dado para atualizar');
        }

        const { error, count, status } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', auth.user.id);

        console.log(`[AUTH API] Supabase update response: status=${status}, rows_affected=${count}, error=`, error);

        if (error) {
            console.error('[AUTH API] Supabase profile update error:', error);
            return jsonError(`Erro ao atualizar perfil no banco: ${error.message}`);
        }

        // Fetch user after update without .single()
        const { data: users, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', auth.user.id);

        if (fetchError) {
            console.error('[AUTH API] Error fetching updated user:', fetchError);
        }

        const user = users?.[0];

        if (!user) {
            console.error('[AUTH API] No user found after update for ID:', auth.user.id);
            return jsonError('Erro ao recuperar perfil atualizado');
        }

        console.log(`[AUTH API] Final updated user in DB:`, JSON.stringify({
            id: user.id,
            email: user.email,
            store_slug: user.store_slug,
            store_active: user.store_active
        }));

        // Sync with Pagar.me if bank details are provided
        if ((body.bank_name || body.bank_account) && user.cpf_cnpj) {
            try {
                const { data: recipients } = await supabase
                    .from('recipients')
                    .select('id, pagarme_recipient_id, status, created_at, updated_at')
                    .eq('user_id', auth.user.id)
                    .order('created_at', { ascending: false });

                const existingRecipient = (recipients || []).find((r: any) => !!r.pagarme_recipient_id) || recipients?.[0];

                // Detect if the document (CPF/CNPJ) changed
                const oldDoc = oldUser?.cpf_cnpj?.replace(/\D/g, '');
                const newDoc = user.cpf_cnpj?.replace(/\D/g, '');
                const documentChanged = oldDoc && newDoc && oldDoc !== newDoc;

                // Handle Bank Code Mapping
                let cleanBankCode = body.bank_name?.replace(/\D/g, '').substring(0, 3);
                if (!cleanBankCode && body.bank_name) {
                    const searchName = body.bank_name.toLowerCase().trim();
                    for (const [name, code] of Object.entries(BANK_CODES)) {
                        if (searchName.includes(name)) {
                            cleanBankCode = code;
                            break;
                        }
                    }
                }

                const cleanAgency = body.bank_agency?.replace(/\D/g, '');
                const cleanAgencyDigit = body.bank_agency_digit?.replace(/\D/g, '') || '0';
                const cleanAccount = body.bank_account?.replace(/\D/g, '');

                const recipientData = {
                    name: user.name,
                    email: user.email,
                    cpf_cnpj: newDoc,
                    type: newDoc.length > 11 ? 'company' : 'individual',
                    bank_code: cleanBankCode || '001',
                    agency: cleanAgency || '0001',
                    agency_digit: cleanAgencyDigit,
                    account: cleanAccount,
                    account_digit: body.bank_account_digit || '0',
                    account_type: body.bank_account_type || 'checking'
                };

                console.log(`[AUTH API] Syncing Recipient Data:`, JSON.stringify(recipientData));

                const isTestRecipient = existingRecipient?.pagarme_recipient_id?.startsWith('re_test_');
                const hasRealRecipient = !!existingRecipient?.pagarme_recipient_id && !isTestRecipient;

                if (hasRealRecipient && documentChanged) {
                    await supabase
                        .from('recipients')
                        .update({ status: existingRecipient.status || 'pending' })
                        .eq('id', existingRecipient.id);

                    return jsonSuccess({
                        user,
                        syncError: {
                            message: 'CPF/CNPJ diferente do recebedor já cadastrado. Para evitar recebedores duplicados na Pagar.me, entre em contato com o suporte para revisar ou recriar manualmente esse recebedor.',
                            details: []
                        }
                    });
                }

                if (hasRealRecipient) {
                    try {
                        // Attempt to update existing
                        const updatedRecipient = await PagarmeService.updateRecipient(existingRecipient.pagarme_recipient_id, recipientData);
                        await supabase
                            .from('recipients')
                            .update({ status: getRecipientStatus(updatedRecipient, 'active') })
                            .eq('id', existingRecipient.id);
                    } catch (updateErr: any) {
                        const errorMsg = updateErr.response?.data?.message || "";
                        if (updateErr.response?.status === 403 || errorMsg.includes("valid status")) {
                            await supabase
                                .from('recipients')
                                .update({ status: existingRecipient.status || 'refused' })
                                .eq('id', existingRecipient.id);

                            return jsonSuccess({
                                user,
                                syncError: {
                                    message: 'A Pagar.me não permitiu atualizar este recebedor. Para evitar duplicidade, nenhum novo recebedor foi criado automaticamente. Revise os dados ou fale com o suporte.',
                                    details: updateErr.response?.data?.errors || []
                                }
                            });
                        } else {
                            throw updateErr; // Re-throw other errors to be caught by the outer catch
                        }
                    }
                } else {
                    // Create new
                    const pRecipient = await PagarmeService.createRecipient(recipientData);
                    const recipientStatus = getRecipientStatus(pRecipient, 'pending');
                    if (existingRecipient) {
                        await supabase
                            .from('recipients')
                            .update({ pagarme_recipient_id: pRecipient.id, status: recipientStatus })
                            .eq('id', existingRecipient.id);
                    } else {
                        await supabase.from('recipients').insert({
                            id: uuidv4(),
                            user_id: auth.user.id,
                            pagarme_recipient_id: pRecipient.id,
                            status: recipientStatus
                        });
                    }
                }
            } catch (pError: any) {
                const errorData = pError.response?.data;
                const errorDetail = getPagarmeErrorMessage(pError);

                console.error('[AUTH API] Pagar.me sync error:', JSON.stringify(errorData || pError.message, null, 2));

                return jsonSuccess({
                    user,
                    syncError: {
                        message: errorDetail,
                        details: errorData?.errors || []
                    }
                });
            }
        }

        return jsonSuccess({ user, message: 'Perfil e dados bancários atualizados' });
    } catch (err) {
        console.error('Update profile error:', err);
        return jsonError('Erro interno do servidor', 500);
    }
}
