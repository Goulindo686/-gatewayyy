import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';
import { PagarmeService } from '@/lib/pagarme';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Não autorizado', 401);

    const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .eq('seller_id', auth.user.id)
        .single();

    if (!sub) return jsonError('Assinatura não encontrada', 404);
    if (sub.status === 'canceled') return jsonError('Assinatura já cancelada');

    try {
        if (sub.pagarme_subscription_id) {
            await PagarmeService.cancelSubscription(sub.pagarme_subscription_id);
        }
    } catch (err: any) {
        console.error('Pagarme cancel error:', err.response?.data || err.message);
    }

    await supabase.from('subscriptions').update({
        status: 'canceled',
        canceled_at: new Date().toISOString()
    }).eq('id', id);

    return jsonSuccess({ message: 'Assinatura cancelada' });
}
