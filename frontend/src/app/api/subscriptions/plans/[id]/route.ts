import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';

// GET público — busca plano pelo ID (para página de checkout de assinatura)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { data: plan } = await supabase
        .from('subscription_plans')
        .select('id, name, description, amount, interval, interval_count, status, product_id')
        .eq('id', id)
        .eq('status', 'active')
        .single();

    if (!plan) return jsonError('Plano não encontrado', 404);

    // Busca checkout_settings do produto vinculado
    let checkoutSettings = null;
    if (plan.product_id) {
        const { data: product } = await supabase
            .from('products')
            .select('name, image_url, description, checkout_settings')
            .eq('id', plan.product_id)
            .single();
        if (product) {
            checkoutSettings = product.checkout_settings;
            return jsonSuccess({ plan: { ...plan, product_name: product.name, product_image: product.image_url, product_description: product.description, checkout_settings: checkoutSettings } });
        }
    }

    return jsonSuccess({ plan });
}

// DELETE — desativa plano (autenticado)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Não autorizado', 401);

    const { error } = await supabase
        .from('subscription_plans')
        .update({ status: 'inactive' })
        .eq('id', id)
        .eq('user_id', auth.user.id);

    if (error) return jsonError('Erro ao desativar plano');
    return jsonSuccess({ message: 'Plano desativado' });
}
