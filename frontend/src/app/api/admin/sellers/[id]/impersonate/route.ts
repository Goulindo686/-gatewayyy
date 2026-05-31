import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess, generateToken } from '@/lib/auth';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const auth = await getAuthUser(req);
    if (!auth || auth.user.role !== 'admin') return jsonError('Não autorizado', 403);

    try {
        const ip =
            req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            req.headers.get('x-real-ip') ||
            'unknown';
        const rl = await checkRateLimit({ key: `admin:impersonate:${auth.user.id}:${ip}`, limit: 20, windowSecs: 3600, failOpen: true });
        if (!rl.allowed) return rateLimitResponse(rl.resetAt);

        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, status, avatar_url')
            .eq('id', id)
            .single();

        if (error || !user) return jsonError('Usuário não encontrado', 404);

        const token = generateToken({
            userId: user.id,
            role: user.role,
            impersonated_by: auth.user.id
        });

        return jsonSuccess({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar_url: user.avatar_url },
            message: `Sessão iniciada como ${user.name}`
        });
    } catch {
        return jsonError('Erro interno', 500);
    }
}
