import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { PagarmeService } from '@/lib/pagarme';
import { v4 as uuidv4 } from 'uuid';

// Helper for error responses with CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
};

const jsonResponse = (data: any, status = 200) => 
    NextResponse.json(data, { status, headers: corsHeaders });

const jsonError = (message: string, status = 400) => 
    NextResponse.json({ error: message, status: 'error' }, { status, headers: corsHeaders });

export async function OPTIONS() {
    return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        // 1. Validate API Key
        const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');
        
        if (!apiKey) {
            return jsonError('Chave de API não fornecida (Header: x-api-key)', 401);
        }

        // 2. Find User by API Key
        const { data: keyRecord, error: keyError } = await supabase
            .from('api_keys')
            .select('user_id, is_active')
            .eq('api_key', apiKey)
            .single();

        if (keyError || !keyRecord) {
            return jsonError('Chave de API inválida', 401);
        }

        if (!keyRecord.is_active) {
            return jsonError('Chave de API inativa', 403);
        }

        const userId = keyRecord.user_id;

        // 3. Get User's Pagar.me Recipient ID
        const { data: recipient, error: recipientError } = await supabase
            .from('recipients')
            .select('pagarme_recipient_id')
            .eq('user_id', userId)
            .single();

        if (recipientError || !recipient) {
            return jsonError('Sua conta não está configurada para receber pagamentos. Configure seus dados bancários no painel.', 400);
        }

        // 4. Parse Body
        const body = await req.json();
        const { amount, description, customer } = body;

        if (!amount || amount < 100) return jsonError('Valor inválido (mínimo 100 centavos)');
        if (!customer || !customer.name || !customer.email || !customer.cpf) {
            return jsonError('Dados do cliente incompletos (name, email, cpf são obrigatórios)');
        }

        // 5. Calculate Platform Fee
        let feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '2');
        try {
            const { data: settingsRow } = await supabase
                .from('platform_settings')
                .select('fee_percentage')
                .limit(1)
                .single();
            if (settingsRow?.fee_percentage !== undefined) {
                feePercentage = settingsRow.fee_percentage;
            }
        } catch {}

        // 6. Create Transaction on Pagar.me
        // PagarmeService.createOrder expects specific structure
        const orderData = {
            amount: amount,
            payment_method: 'pix',
            customer: {
                name: customer.name,
                email: customer.email,
                cpf: customer.cpf, // PagarmeService uses .cpf
                phone: customer.phone // PagarmeService uses .phone string
            },
            seller_recipient_id: recipient.pagarme_recipient_id,
            platform_fee_percentage: feePercentage
        };

        const pagarmeOrder = await PagarmeService.createOrder(orderData);

        // 7. Extract Pix Data
        const extractPix = (order: any) => {
            const charge = order?.charges?.[0];
            const lastTransaction = charge?.last_transaction;
            
            const candidates = [
                lastTransaction?.qr_code,
                lastTransaction?.qrCode,
                charge?.last_transaction?.qr_code_url,
                order?.qr_code
            ].filter(Boolean);

            // Try to find QR Code and URL
            // Pagar.me response structure varies
            let qrCode = charge?.last_transaction?.qr_code || charge?.last_transaction?.qrCode;
            let qrCodeUrl = charge?.last_transaction?.qr_code_url || charge?.last_transaction?.qrCodeUrl;

            return { qr_code: qrCode, qr_code_url: qrCodeUrl };
        };

        const pixData = extractPix(pagarmeOrder);

        if (!pixData.qr_code) {
            console.error('Pagar.me Order Response (Missing QR):', JSON.stringify(pagarmeOrder, null, 2));
            // Tentar identificar o motivo na resposta
            const status = pagarmeOrder.status;
            const charges = pagarmeOrder.charges || [];
            const lastChargeStatus = charges[0]?.status;
            
            if (status === 'failed' || lastChargeStatus === 'failed') {
                const charge = charges[0];
                const transaction = charge?.last_transaction;
                
                const failureReason = {
                    status: status,
                    charge_status: lastChargeStatus,
                    acquirer_message: transaction?.acquirer_message,
                    gateway_errors: transaction?.gateway_response?.errors,
                    recipient_id: recipient.pagarme_recipient_id,
                    platform_id: process.env.PLATFORM_RECIPIENT_ID
                };

                const errorMsg = JSON.stringify(failureReason, null, 2);
                console.error('Pagar.me Failed Order:', errorMsg);
                throw new Error(`Falha Pagar.me: ${errorMsg}`);
            }
            
            throw new Error('O Pagar.me recebeu o pedido mas não retornou o QR Code Pix. Verifique os logs.');
        }

        // 8. Save Transaction Record (Optional but recommended)
        // We save it as 'api_sale' type
        const orderId = uuidv4();
        const { error: insertError } = await supabase.from('transactions').insert({
            id: orderId,
            user_id: userId,
            amount: amount,
            status: 'pending',
            type: 'api_sale',
            description: description || 'Venda via API',
            payment_method: 'pix',
            pagarme_id: pagarmeOrder.id,
            customer_email: customer.email,
            customer_name: customer.name
        });

        if (insertError) {
            console.error('CRITICAL ERROR: Failed to save API transaction:', insertError);
            console.error('Transaction details:', { orderId, userId, amount, pagarme_id: pagarmeOrder.id });
            // Should we return error? If we return error, the client will think it failed.
            // But the Pagar.me order WAS created.
            // It is safer to return error so the client doesn't try to use an ID that doesn't exist in our DB.
            return jsonError('Erro interno: Pagamento criado mas falha ao registrar transação. Contate o suporte.', 500);
        }

        return jsonResponse({
            success: true,
            transaction_id: orderId,
            pix: {
                qr_code: pixData.qr_code,
                qr_code_url: pixData.qr_code_url,
                expires_at: pagarmeOrder.charges?.[0]?.last_transaction?.expires_at
            },
            amount: amount,
            status: 'pending'
        });

    } catch (error: any) {
        console.error('API Pix Error:', error);
        
        if (error.response?.data) {
             const axiosError = JSON.stringify(error.response.data, null, 2);
             return jsonError(`Erro Pagar.me API: ${axiosError}`, error.response.status || 400);
        }

        return jsonError(error.message || 'Erro interno ao processar pagamento', 500);
    }
}
