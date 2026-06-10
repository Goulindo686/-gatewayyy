const UTMIFY_ENDPOINT = 'https://api.utmify.com.br/api-credentials/orders';

type UtmifyStatus = 'waiting_payment' | 'paid' | 'refused' | 'refunded' | 'chargedback';

function formatDateUTC(value?: string | Date | null) {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

function cleanDigits(value: any) {
    const digits = String(value || '').replace(/\D/g, '');
    return digits || null;
}

function getTracking(order: any) {
    return {
        src: order?.utm_src || null,
        sck: order?.utm_sck || null,
        utm_source: order?.utm_source || null,
        utm_campaign: order?.utm_campaign || null,
        utm_medium: order?.utm_medium || null,
        utm_content: order?.utm_content || null,
        utm_term: order?.utm_term || null,
    };
}

function getGatewayFee(order: any) {
    const amount = Number(order?.amount || 0);
    if (!amount) return 0;
    if (order?.payment_method === 'credit_card') return Math.max(0, Math.round(amount * 0.02));
    return Math.min(200, amount);
}

export function buildUtmifyPayload({
    order,
    product,
    status = 'paid',
    isTest = false,
}: {
    order: any;
    product?: any;
    status?: UtmifyStatus;
    isTest?: boolean;
}) {
    const amount = Number(order?.amount || 0);
    const gatewayFee = getGatewayFee(order);

    return {
        orderId: String(order?.id),
        platform: 'GouPay',
        paymentMethod: order?.payment_method === 'credit_card' ? 'credit_card' : 'pix',
        status,
        createdAt: formatDateUTC(order?.created_at) || formatDateUTC(new Date()),
        approvedDate: status === 'paid' ? formatDateUTC(new Date()) : null,
        refundedAt: status === 'refunded' ? formatDateUTC(new Date()) : null,
        customer: {
            name: order?.buyer_name || 'Cliente',
            email: order?.buyer_email || '',
            phone: cleanDigits(order?.buyer_phone),
            document: cleanDigits(order?.buyer_cpf),
            country: 'BR',
            ip: order?.client_ip || null,
        },
        products: [{
            id: String(product?.id || order?.product_id || order?.id),
            name: product?.name || 'Produto',
            planId: order?.plan_id || null,
            planName: order?.plan_name || null,
            quantity: 1,
            priceInCents: amount,
        }],
        trackingParameters: getTracking(order),
        commission: {
            totalPriceInCents: amount,
            gatewayFeeInCents: gatewayFee,
            userCommissionInCents: Math.max(0, amount - gatewayFee),
            currency: 'BRL',
        },
        isTest,
    };
}

export async function sendUtmifyOrder({
    token,
    order,
    product,
    status = 'paid',
    isTest = false,
}: {
    token?: string | null;
    order: any;
    product?: any;
    status?: UtmifyStatus;
    isTest?: boolean;
}) {
    const apiToken = String(token || '').trim();
    if (!apiToken) return { skipped: true, reason: 'missing_token' };

    const payload = buildUtmifyPayload({ order, product, status, isTest });
    const response = await fetch(UTMIFY_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-token': apiToken,
        },
        body: JSON.stringify(payload),
    });

    let data: any = null;
    try {
        data = await response.json();
    } catch {
        data = await response.text().catch(() => null);
    }

    if (!response.ok) {
        return {
            ok: false,
            status: response.status,
            error: typeof data === 'string' ? data : data?.message || data?.error || 'Utmify API error',
            data,
        };
    }

    return { ok: true, status: response.status, data, payload };
}
