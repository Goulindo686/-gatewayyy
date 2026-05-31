import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const auth = await getAuthUser(req);
    if (!auth || auth.user.role !== 'admin') return jsonError('Não autorizado', 403);

    try {
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const rl = await checkRateLimit({ key: `admin:sellers:block:${auth.user.id}:${ip}`, limit: 30, windowSecs: 60, failOpen: true });
        if (!rl.allowed) return rateLimitResponse(rl.resetAt);

        const { blocked } = await req.json();
        const newStatus = blocked ? 'blocked' : 'active';

        const { error } = await supabase
            .from('users').update({ status: newStatus }).eq('id', id).eq('role', 'seller');

        if (error) return jsonError('Erro ao atualizar vendedor');

        return jsonSuccess({ message: `Vendedor ${blocked ? 'bloqueado' : 'desbloqueado'}` });
    } catch {
        return jsonError('Erro interno', 500);
    }
}
