'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { FiLock, FiRepeat, FiClock, FiPackage, FiCheck } from 'react-icons/fi';

const DEFAULT_SETTINGS = {
    theme: 'dark', banner_url: '', banner_text: '', show_countdown: false,
    countdown_minutes: 15, countdown_text: 'Oferta expira em:', countdown_color: '#6C5CE7',
    notice_text: '', notice_type: 'warning', accent_color: '#6C5CE7',
    hide_product_image: false, banner_mode_desktop: 'cover', banner_mode_mobile: 'contain',
    banner_height_desktop: 300, banner_height_mobile: 200, banner_position: 'center',
    hide_phone: false,
};

export default function SubscribePage() {
    const { planId } = useParams() as { planId: string };
    const router = useRouter();
    const [plan, setPlan] = useState<any>(null);
    const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [timerSeconds, setTimerSeconds] = useState(0);

    const [customer, setCustomer] = useState({ name: '', email: '', cpf: '', phone: '' });
    const [card, setCard] = useState({ number: '', holder_name: '', exp_month: '', exp_year: '', cvv: '' });
    const [address, setAddress] = useState({ zip_code: '', street: '', number: '', city: '', state: '' });

    useEffect(() => {
        api.get(`/subscriptions/plans/${planId}`)
            .then(r => {
                setPlan(r.data.plan);
                if (r.data.plan?.checkout_settings) {
                    const s = { ...DEFAULT_SETTINGS, ...r.data.plan.checkout_settings };
                    setSettings(s);
                    if (s.show_countdown && s.countdown_minutes > 0) {
                        setTimerSeconds(s.countdown_minutes * 60);
                    }
                }
            })
            .catch(() => toast.error('Plano não encontrado'))
            .finally(() => setLoading(false));
    }, [planId]);

    useEffect(() => {
        if (timerSeconds <= 0) return;
        const t = setInterval(() => setTimerSeconds(s => s > 0 ? s - 1 : 0), 1000);
        return () => clearInterval(t);
    }, [timerSeconds]);

    useEffect(() => {
        if (!success) return;
        if (countdown <= 0) { router.push('/area-membros'); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [success, countdown, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/subscriptions/subscribe', {
                plan_id: planId, customer,
                card: { ...card, exp_month: parseInt(card.exp_month), exp_year: parseInt(card.exp_year) },
                address
            });
            const data = res.data;
            if (data.auth?.token) {
                localStorage.setItem('token', data.auth.token);
                localStorage.setItem('user', JSON.stringify(data.auth.user));
            }
            setSuccess(true);
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erro ao processar assinatura');
        } finally {
            setSubmitting(false);
        }
    };

    const fmtBRL = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
    const fmtInterval = (interval: string) => ({ week: 'semana', month: 'mês', year: 'ano' }[interval] || interval);
    const formatTimer = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

    // Theme
    const isLight = settings.theme === 'light';
    const bgPrimary = isLight ? '#f8f9fa' : 'var(--bg-primary, #0a0a0c)';
    const bgCard = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(20,20,23,0.95)';
    const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)';
    const textPrimary = isLight ? '#1a1a2e' : '#ffffff';
    const textSecondary = isLight ? '#555' : '#94a3b8';
    const textMuted = isLight ? '#888' : '#64748b';
    const inputBg = isLight ? '#fff' : 'rgba(255,255,255,0.04)';
    const accent = settings.accent_color || '#6C5CE7';
    const hasBanner = !!(settings.banner_url || settings.banner_text);
    const hasCountdown = settings.show_countdown && timerSeconds > 0;

    const noticeColors: any = {
        warning: { bg: 'rgba(253,203,110,0.12)', border: 'rgba(253,203,110,0.3)', text: '#FDCB6E' },
        info: { bg: 'rgba(116,185,255,0.12)', border: 'rgba(116,185,255,0.3)', text: '#74B9FF' },
        success: { bg: 'rgba(85,239,196,0.12)', border: 'rgba(85,239,196,0.3)', text: '#55EFC4' },
    };

    const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 10, border: `1px solid ${borderColor}`, background: inputBg, color: textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgPrimary }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${borderColor}`, borderTopColor: accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (!plan) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgPrimary, color: textPrimary }}>
            <p>Plano não encontrado.</p>
        </div>
    );

    if (success) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bgPrimary, color: textPrimary, flexDirection: 'column', gap: 16, padding: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiCheck size={40} style={{ color: accent }} />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800 }}>Assinatura ativada!</h2>
            <p style={{ color: textSecondary, textAlign: 'center' }}>Você assinou o plano <strong>{plan.name}</strong>. A cobrança foi realizada no seu cartão.</p>
            <p style={{ color: textMuted, fontSize: 14 }}>Redirecionando em <strong style={{ color: accent }}>{countdown}s</strong>...</p>
            <button onClick={() => router.push('/area-membros')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: accent, color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                Ir para Área de Membros agora
            </button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: bgPrimary, color: textPrimary, display: 'flex', flexDirection: 'column' }}>
            {/* Countdown */}
            {hasCountdown && (
                <div style={{ background: settings.countdown_color || accent, color: 'white', padding: '10px 16px', textAlign: 'center', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, position: 'sticky', top: 0, zIndex: 50 }}>
                    <FiClock size={14} />
                    {settings.countdown_text}
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 16, background: 'rgba(0,0,0,0.2)', padding: '3px 10px', borderRadius: 6 }}>
                        {formatTimer(timerSeconds)}
                    </span>
                </div>
            )}

            {/* Banner */}
            {hasBanner && (
                <div style={{
                    height: settings.banner_url ? (settings.banner_height_desktop || 300) : 'auto',
                    position: 'relative',
                    background: settings.banner_url
                        ? `url(${settings.banner_url}) ${settings.banner_position || 'center'}/${settings.banner_mode_desktop === 'contain' ? 'contain' : 'cover'} no-repeat`
                        : `linear-gradient(135deg, ${accent}44, ${accent}11)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {settings.banner_url && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />}
                    {settings.banner_text && (
                        <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px', fontSize: 22, fontWeight: 800, color: 'white', textShadow: settings.banner_url ? '0 2px 12px rgba(0,0,0,0.5)' : 'none', textAlign: 'center' }}>
                            {settings.banner_text}
                        </div>
                    )}
                </div>
            )}

            {/* Notice */}
            {settings.notice_text && (
                <div style={{ maxWidth: 1000, margin: '16px auto 0', padding: '0 24px', width: '100%' }}>
                    <div style={{ padding: '14px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, background: noticeColors[settings.notice_type]?.bg, border: `1px solid ${noticeColors[settings.notice_type]?.border}`, color: noticeColors[settings.notice_type]?.text, textAlign: 'center' }}>
                        {settings.notice_text}
                    </div>
                </div>
            )}

            {/* Layout 2 colunas */}
            <div style={{ maxWidth: 1100, margin: `${hasBanner ? '0' : '0'} auto`, padding: hasBanner ? '0 24px 40px' : '40px 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: 32, alignItems: 'start', flex: 1, width: '100%' }} className="subscribeLayout">

                {/* Coluna esquerda — info do produto/plano */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ overflow: 'hidden', background: bgCard, borderRadius: 16, border: `1px solid ${borderColor}` }}>
                        {/* Foto do produto */}
                        {!settings.hide_product_image && (
                            <div style={{ height: 220, background: `linear-gradient(135deg, ${accent}22, ${accent}0a)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {plan.product_image ? (
                                    <img src={plan.product_image} alt={plan.product_name || plan.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <FiPackage size={48} style={{ opacity: 0.3, color: textMuted }} />
                                )}
                            </div>
                        )}
                        <div style={{ padding: 28 }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${accent}22`, color: accent, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                                <FiRepeat size={12} /> Assinatura Recorrente
                            </div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: textPrimary }}>{plan.product_name || plan.name}</h1>
                            {(plan.product_description || plan.description) && (
                                <p style={{ fontSize: 14, color: textSecondary, lineHeight: 1.6, marginBottom: 16 }}>{plan.product_description || plan.description}</p>
                            )}
                            <div style={{ fontSize: 32, fontWeight: 800, color: accent }}>
                                {fmtBRL(plan.amount)}
                                <span style={{ fontSize: 16, color: textMuted, fontWeight: 500 }}> / {fmtInterval(plan.interval)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coluna direita — formulário */}
                <div style={{ padding: 28, background: bgCard, borderRadius: 16, border: `1px solid ${borderColor}` }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, color: textPrimary }}>Assinar Agora</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Dados pessoais */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: textSecondary, marginBottom: 6, display: 'block' }}>Nome completo</label>
                            <input style={inputStyle} placeholder="Seu nome" required value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: textSecondary, marginBottom: 6, display: 'block' }}>E-mail</label>
                                <input style={inputStyle} type="email" placeholder="seu@email.com" required value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: textSecondary, marginBottom: 6, display: 'block' }}>CPF</label>
                                <input style={inputStyle} placeholder="000.000.000-00" required value={customer.cpf} onChange={e => setCustomer({ ...customer, cpf: e.target.value })} />
                            </div>
                        </div>
                        {!settings.hide_phone && (
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 13, fontWeight: 500, color: textSecondary, marginBottom: 6, display: 'block' }}>Telefone</label>
                                <input style={inputStyle} placeholder="(11) 99999-9999" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                            </div>
                        )}

                        {/* Endereço */}
                        <div style={{ marginBottom: 16 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: textSecondary, marginBottom: 10 }}>Endereço de cobrança</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>CEP</label>
                                    <input style={inputStyle} placeholder="00000-000" required maxLength={9} value={address.zip_code} onChange={e => setAddress({ ...address, zip_code: e.target.value.replace(/\D/g, '') })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Número</label>
                                    <input style={inputStyle} placeholder="Nº" required value={address.number} onChange={e => setAddress({ ...address, number: e.target.value })} />
                                </div>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Rua</label>
                                <input style={inputStyle} placeholder="Rua / Logradouro" required value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Cidade</label>
                                    <input style={inputStyle} placeholder="Cidade" required value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Estado (UF)</label>
                                    <input style={inputStyle} placeholder="UF" maxLength={2} required value={address.state} onChange={e => setAddress({ ...address, state: e.target.value.toUpperCase() })} />
                                </div>
                            </div>
                        </div>

                        {/* Cartão */}
                        <div style={{ marginBottom: 20 }}>
                            <h3 style={{ fontSize: 13, fontWeight: 700, color: textSecondary, marginBottom: 10 }}>Cartão de crédito</h3>
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Número do cartão</label>
                                <input style={inputStyle} placeholder="0000 0000 0000 0000" maxLength={19} required value={card.number} onChange={e => setCard({ ...card, number: e.target.value })} />
                            </div>
                            <div style={{ marginBottom: 10 }}>
                                <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Nome no cartão</label>
                                <input style={inputStyle} placeholder="Nome como está no cartão" required value={card.holder_name} onChange={e => setCard({ ...card, holder_name: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Mês</label>
                                    <input style={inputStyle} placeholder="MM" maxLength={2} required value={card.exp_month} onChange={e => setCard({ ...card, exp_month: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>Ano</label>
                                    <input style={inputStyle} placeholder="AAAA" maxLength={4} required value={card.exp_year} onChange={e => setCard({ ...card, exp_year: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: textMuted, marginBottom: 4, display: 'block' }}>CVV</label>
                                    <input style={inputStyle} placeholder="CVV" maxLength={4} required value={card.cvv} onChange={e => setCard({ ...card, cvv: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} style={{
                            width: '100%', padding: 16, borderRadius: 14, border: 'none',
                            background: submitting ? borderColor : accent,
                            color: isLight ? 'white' : '#0a0a0c',
                            fontWeight: 800, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer'
                        }}>
                            {submitting ? 'Processando...' : `Assinar por ${fmtBRL(plan.amount)}/${fmtInterval(plan.interval)}`}
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: textMuted, fontSize: 12 }}>
                            <FiLock size={12} /> Pagamento seguro via Pagar.me
                        </div>
                    </form>
                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 768px) {
                    .subscribeLayout {
                        grid-template-columns: 1fr !important;
                        padding: 16px !important;
                    }
                }
            `}</style>
        </div>
    );
}
