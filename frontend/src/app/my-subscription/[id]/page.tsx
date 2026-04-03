'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiRepeat, FiX } from 'react-icons/fi';

export default function MySubscriptionPage() {
    const { id } = useParams() as { id: string };
    const [sub, setSub] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [canceling, setCanceling] = useState(false);
    const [canceled, setCanceled] = useState(false);

    useEffect(() => {
        fetch(`/api/subscriptions/public/${id}`)
            .then(r => r.json())
            .then(d => { if (d.subscription) setSub(d.subscription); })
            .catch(() => toast.error('Assinatura não encontrada'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleCancel = async () => {
        if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você perderá o acesso ao final do período atual.')) return;
        setCanceling(true);
        try {
            const res = await fetch(`/api/subscriptions/public/${id}/cancel`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setCanceled(true);
            toast.success('Assinatura cancelada.');
        } catch (err: any) {
            toast.error(err.message || 'Erro ao cancelar');
        } finally {
            setCanceling(false);
        }
    };

    const fmtBRL = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
    const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');
    const statusMap: Record<string, { label: string; color: string }> = {
        active:   { label: 'Ativa',     color: '#00cec9' },
        pending:  { label: 'Pendente',  color: '#f39c12' },
        past_due: { label: 'Em atraso', color: '#e17055' },
        canceled: { label: 'Cancelada', color: '#636e72' },
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #222', borderTopColor: '#00cec9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!sub) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c', color: 'white' }}>
            <p>Assinatura não encontrada.</p>
        </div>
    );

    const st = statusMap[canceled ? 'canceled' : sub.status] || { label: sub.status, color: '#636e72' };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0c', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
            <div style={{ width: '100%', maxWidth: 440, background: '#141417', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)', padding: 36 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 16, background: 'rgba(0,206,201,0.12)', marginBottom: 14 }}>
                        <FiRepeat size={24} color="#00cec9" />
                    </div>
                    <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 }}>Minha Assinatura</h1>
                    <span style={{ background: `${st.color}22`, color: st.color, padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                        {st.label}
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                    <Row label="Plano" value={sub.subscription_plans?.name || '—'} />
                    <Row label="Valor" value={fmtBRL(sub.amount)} />
                    <Row label="Cliente" value={sub.customer_name} />
                    <Row label="E-mail" value={sub.customer_email} />
                    {sub.current_period_end && (
                        <Row label="Próxima cobrança" value={fmtDate(sub.current_period_end)} />
                    )}
                    {sub.canceled_at && (
                        <Row label="Cancelada em" value={fmtDate(sub.canceled_at)} />
                    )}
                </div>

                {!canceled && sub.status !== 'canceled' && (
                    <button
                        onClick={handleCancel}
                        disabled={canceling}
                        style={{
                            width: '100%', padding: 14, borderRadius: 14, border: '1px solid rgba(231,76,60,0.4)',
                            background: 'rgba(231,76,60,0.08)', color: '#e74c3c',
                            fontWeight: 700, fontSize: 14, cursor: canceling ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        <FiX size={16} />
                        {canceling ? 'Cancelando...' : 'Cancelar Assinatura'}
                    </button>
                )}

                {(canceled || sub.status === 'canceled') && (
                    <div style={{ textAlign: 'center', color: '#636e72', fontSize: 14 }}>
                        Assinatura cancelada. Você mantém o acesso até o fim do período atual.
                    </div>
                )}
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>{label}</span>
            <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>{value}</span>
        </div>
    );
}
