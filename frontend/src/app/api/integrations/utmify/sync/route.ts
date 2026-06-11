export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { decryptUtmifyToken, sendPaidOrderToUtmify } from '@/lib/utmify';

export async function POST(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth?.user) return jsonError('Nao autorizado', 401);
    if (auth.tokenPayload?.impersonated_by) return jsonError('Acao bloqueada durante acesso como vendedor', 403);

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
    const rl = await checkRateLimit({ key: `utmify:sync:${auth.user.id}:${ip}`, limit: 10, windowSecs: 3600, failOpen: true });
    if (!rl.allowed) return rateLimitResponse(rl.resetAt);

    const token = decryptUtmifyToken(auth.user.utmify_api_token);
    if (!auth.user.utmify_enabled || !token) {
        return jsonError('Ative a UTMify e salve a credencial antes de sincronizar.');
    }

    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', auth.user.id)
        .eq('status', 'paid')
        .is('utmify_sent_at', null)
        .order('created_at', { ascending: false })
        .limit(25);

    if (error) return jsonError(`Erro ao buscar vendas pagas: ${error.message}`, 500);

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const order of orders || []) {
        try {
            const result = await sendPaidOrderToUtmify(order);
            if ((result as any).ok) sent++;
            else if ((result as any).skipped) skipped++;
            else failed++;
        } catch (err) {
            failed++;
            console.error('[UTMIFY] Manual sync order error:', order.id, err);
        }
    }

    return jsonSuccess({
        message: `Sincronizacao concluida: ${sent} enviada(s), ${failed} falha(s), ${skipped} ignorada(s).`,
        sent,
        failed,
        skipped,
    });
}
