import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';

// GET — lista assinaturas do vendedor
export async function GET(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Não autorizado', 401);

    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(name, interval, interval_count)')
        .eq('seller_id', auth.user.id)
        .order('created_at', { ascending: false });

    return jsonSuccess({ subscriptions: subscriptions || [] });
}
