export const dynamic = 'force-dynamic';
export const maxDuration = 30; // aumenta o timeout para 30 segundos

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
        console.log(`[FORGOT-PASSWORD] Email: ${email}, User found: ${!!user}`);

        if (user) {
            const resetToken = uuidv4();
            const resetExpires = new Date(Date.now() + 3600000);

            const { error } = await supabase
                .from('users')
                .update({
                    password_reset_token: resetToken,
                    password_reset_expires: resetExpires.toISOString()
                })
                .eq('id', user.id);

            if (!error) {
                // Envia o email aguardando a resposta completa
                try {
                    await sendPasswordResetEmail({
                        toEmail: user.email,
                        userName: user.name,
                        resetToken,
                    });
                    console.log(`[FORGOT-PASSWORD] Email enviado para ${user.email}`);
                } catch (emailErr: any) {
                    console.error(`[FORGOT-PASSWORD] ERRO:`, emailErr?.message, emailErr?.code, emailErr?.response);
                }
            }
        }

        return jsonSuccess({
            message: 'Se o email existir, as instruções de recuperação serão enviadas.'
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return jsonError('Erro interno do servidor', 500);
    }
}
