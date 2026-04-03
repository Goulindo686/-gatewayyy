import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { jsonError, jsonSuccess } from '@/lib/auth';
import { PagarmeService } from '@/lib/pagarme';

// POST público — cliente cancela própria assinatura
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, status, pagarme_subscription_id')
        .eq('id', id)
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

    return jsonSuccess({ message: 'Assinatura cancelada com sucesso' });
}
