export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { jsonError, jsonSuccess } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) return jsonError('Email é obrigatório');

        const { data: users } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', email);

        const user = users?.[0];
        console.log(`[FORGOT-PASSWORD] Email: ${email}, User found: ${!!user}, Users count: ${users?.length}`);

        if (user) {
            const resetToken = uuidv4();
            const resetExpires = new Date(Date.now() + 3600000); // 1 hora

            const { error } = await supabase
                .from('users')
                .update({
                    password_reset_token: resetToken,
                    password_reset_expires: resetExpires.toISOString()
                })
                .eq('id', user.id);

            if (!error) {
                sendPasswordResetEmail({
                    toEmail: user.email,
                    userName: user.name,
                    resetToken,
                }).catch(err => console.error('[EMAIL] Erro ao enviar recuperação de senha:', err.message));
            }
        }

        // Sempre retorna sucesso para não revelar se o email existe
        return jsonSuccess({
            message: 'Se o email existir, as instruções de recuperação serão enviadas.'
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return jsonError('Erro interno do servidor', 500);
    }
}
