import { NextRequest } from 'next/server';
import { supabase } from '@/lib/db';
import { getAuthUser, jsonError, jsonSuccess } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type RecoverySetting = {
    product_id: string;
    enabled: boolean;
    delay_minutes: number;
    updated_at?: string;
};

type ProductRow = {
    id: string;
    name: string;
    price: number;
    price_display?: string;
    image_url?: string;
    status: string;
};

export async function GET(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Nao autorizado', 401);

    const [{ data: products, error: productsError }, { data: settings, error: settingsError }, { data: sentEmails }] = await Promise.all([
        supabase
            .from('products')
            .select('id, name, price, price_display, image_url, status')
            .eq('user_id', auth.user.id)
            .order('created_at', { ascending: false }),
        supabase
            .from('sales_recovery_settings')
            .select('product_id, enabled, delay_minutes, updated_at')
            .eq('user_id', auth.user.id),
        supabase
            .from('sales_recovery_emails')
            .select('product_id')
            .eq('user_id', auth.user.id),
    ]);

    if (productsError || settingsError) {
        console.error('[SALES RECOVERY] Failed to load settings:', productsError || settingsError);
        return jsonError('Erro ao carregar recuperacao de vendas', 500);
    }

    const settingsByProduct = Object.fromEntries((settings || []).map((item: RecoverySetting) => [item.product_id, item]));
    const sentByProduct = (sentEmails || []).reduce((acc: Record<string, number>, item: { product_id: string }) => {
        acc[item.product_id] = (acc[item.product_id] || 0) + 1;
        return acc;
    }, {});

    return jsonSuccess({
        products: (products || []).map((product: ProductRow) => ({
            ...product,
            price_display: product.price_display || (product.price / 100).toFixed(2),
            recovery: settingsByProduct[product.id] || {
                product_id: product.id,
                enabled: false,
                delay_minutes: 30,
            },
            reminders_sent: sentByProduct[product.id] || 0,
        })),
    });
}

export async function PUT(req: NextRequest) {
    const auth = await getAuthUser(req);
    if (!auth) return jsonError('Nao autorizado', 401);

    const body = await req.json();
    const productId = String(body.product_id || '');
    const delayMinutes = Number(body.delay_minutes);

    if (!productId) return jsonError('Selecione um produto');
    if (!Number.isInteger(delayMinutes) || delayMinutes < 5 || delayMinutes > 1440) {
        return jsonError('O tempo deve ficar entre 5 minutos e 24 horas');
    }

    const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('id', productId)
        .eq('user_id', auth.user.id)
        .single();

    if (!product) return jsonError('Produto nao encontrado', 404);

    const { data: setting, error } = await supabase
        .from('sales_recovery_settings')
        .upsert({
            user_id: auth.user.id,
            product_id: productId,
            enabled: Boolean(body.enabled),
            delay_minutes: delayMinutes,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,product_id' })
        .select('product_id, enabled, delay_minutes, updated_at')
        .single();

    if (error) {
        console.error('[SALES RECOVERY] Failed to save setting:', error);
        return jsonError('Erro ao salvar configuracao', 500);
    }

    return jsonSuccess({ setting });
}
