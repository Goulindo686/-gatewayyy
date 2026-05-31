export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { PagarmeService } from '@/lib/pagarme';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Não autorizado', 401);

    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        req.headers.get('x-real-ip') ||
        'unknown';
    const rl = await checkRateLimit({ key: `withdrawals:get:ip:${ip}`, limit: 120, windowSecs: 60, failOpen: true });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    // Busca registros locais do Supabase
    const { data: localWithdrawals } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('created_at', { ascending: false });

    const localFormatted = (localWithdrawals || []).map(w => ({
        id: w.id,
        amount_display: w.amount_display || (w.amount / 100).toFixed(2),
        pix_key: w.pix_key || '—',
        status: w.status || 'completed',
        created_at: w.created_at,
        source: 'local'
    }));

    // Busca transferências diretamente do Pagar.me
    try {
        const { data: recipient } = await supabase
            .from('recipients')
            .select('pagarme_recipient_id')
            .eq('user_id', auth.user.id)
            .single();

        if (recipient?.pagarme_recipient_id) {
            const transfersData = await PagarmeService.getRecipientTransfers(recipient.pagarme_recipient_id);
            const pagarmeTransfers = (transfersData?.data || []).map((t: any) => ({
                id: t.id,
                amount_display: (t.amount / 100).toFixed(2),
                pix_key: t.bank_account?.pix_key || t.bank_account?.account || '—',
                status: t.status === 'transferred' ? 'completed' : t.status || 'completed',
                created_at: t.created_at,
                source: 'pagarme'
            }));

            // Mescla: usa Pagar.me como fonte principal, remove duplicatas pelo pagarme_transfer_id
            const localTransferIds = new Set(
                (localWithdrawals || []).map(w => w.pagarme_transfer_id).filter(Boolean)
            );
            const onlyPagarme = pagarmeTransfers.filter((t: any) => !localTransferIds.has(t.id));
            const merged = [...localFormatted, ...onlyPagarme]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            return jsonSuccess({ withdrawals: merged });
        }
    } catch (err: any) {
        console.error('Pagar.me transfers fetch error:', err.response?.data || err.message);
        // fallback para registros locais
    }

    return jsonSuccess({ withdrawals: localFormatted });
}

export async function POST(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Não autorizado', 401);

    try {
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';

        const rlIp = await checkRateLimit({ key: `withdrawals:post:ip:${ip}`, limit: 10, windowSecs: 3600, failOpen: true });
        if (!rlIp.allowed) return rateLimitResponse(rlIp.resetAt);

        const rlUser = await checkRateLimit({ key: `withdrawals:post:user:${auth.user.id}`, limit: 5, windowSecs: 3600, failOpen: true });
        if (!rlUser.allowed) return rateLimitResponse(rlUser.resetAt);

        const { amount } = await req.json();
        if (!amount || amount <= 0) return jsonError('Valor inválido');

        const amountInCents = Math.round(amount * 100);

        // Get recipient
        const { data: recipient } = await supabase
            .from('recipients').select('pagarme_recipient_id').eq('user_id', auth.user.id).single();

        if (!recipient) return jsonError('Recebedor não encontrado', 404);

        // Create transfer
        const transfer = await PagarmeService.createTransfer(recipient.pagarme_recipient_id, amountInCents);

        // Record withdrawal
        const { data: withdrawal } = await supabase.from('withdrawals').insert({
            id: uuidv4(), user_id: auth.user.id,
            amount: amountInCents, amount_display: amount.toFixed(2),
            pix_key: auth.user.pix_key, status: 'processing',
            pagarme_transfer_id: transfer.id
        }).select().single();

        // Record transaction
        await supabase.from('transactions').insert({
            id: uuidv4(), user_id: auth.user.id,
            type: 'withdrawal', amount: amountInCents, amount_display: amount.toFixed(2),
            status: 'confirmed', description: `Saque de R$ ${amount.toFixed(2)}`
        });

        return jsonSuccess({ withdrawal }, 201);
    } catch (err: any) {
        const errorData = err.response?.data;
        console.error('Withdrawal error:', JSON.stringify(errorData || err.message, null, 2));

        // If it's a Pagar.me error, try to be more specific
        let errorMessage = 'Erro ao processar saque';
        if (errorData?.message) {
            errorMessage = `Pagar.me: ${errorData.message}`;
        }

        return jsonError(errorMessage, 500);
    }
}
