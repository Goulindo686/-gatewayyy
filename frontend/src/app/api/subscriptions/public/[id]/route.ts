import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { jsonError, jsonSuccess } from '@/lib/auth';

// GET público — cliente consulta própria assinatura pelo ID
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, status, amount, customer_name, customer_email, current_period_end, canceled_at, subscription_plans(name, interval)')
        .eq('id', id)
        .single();

    if (!sub) return jsonError('Assinatura não encontrada', 404);

    return jsonSuccess({ subscription: sub });
}
