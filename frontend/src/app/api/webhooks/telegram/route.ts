import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/telegram';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        
        // Telegram envia updates com a chave 'message' ou 'edited_message'
        const message = body.message || body.edited_message;
        
        if (message) {
            await handleWebhook(message);
        }
        
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram webhook error:', error);
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
