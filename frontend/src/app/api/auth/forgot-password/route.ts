export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { jsonError, jsonSuccess } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) return jsonError('Email é obrigatório');

        // Check if user exists in our custom users table
        const { data: users } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', email);

        const user = users?.[0];
        let resetToken: string | null = null;

        // If user exists, generate reset token
        if (user) {
            resetToken = uuidv4();
            const resetExpires = new Date(Date.now() + 3600000); // 1 hour

            const { error } = await supabase
                .from('users')
                .update({
                    password_reset_token: resetToken,
                    password_reset_expires: resetExpires.toISOString()
                })
                .eq('id', user.id);

            if (!error) {
                // Build reset URL
                const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.goupay.com.br'}/reset-password?token=${resetToken}`;
                
                console.log('\n=== PASSWORD RESET REQUEST ===');
                console.log('Email:', email);
                console.log('Reset URL:', resetUrl);
                console.log('Token:', resetToken);
                console.log('Expires:', new Date(Date.now() + 3600000).toISOString());
                console.log('==============================\n');

                // TODO: Integrate with email service
                // For now, we're logging the link
                // In production, you can:
                // 1. Use Supabase Edge Functions to send email
                // 2. Call backend API to send email via nodemailer
                // 3. Use a service like Resend, SendGrid, etc.
            }
        }

        // Always return success for security (don't reveal if email exists)
        return jsonSuccess({ 
            message: 'Se o email existir, as instruções de recuperação serão enviadas.',
            // In development, include the reset URL for testing
            ...(process.env.NODE_ENV === 'development' && resetToken ? {
                dev_reset_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.goupay.com.br'}/reset-password?token=${resetToken}`
            } : {})
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        return jsonError('Erro interno do servidor', 500);
    }
}
