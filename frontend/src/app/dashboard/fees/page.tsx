'use client';

import { useState } from 'react';
import { FiZap, FiCreditCard, FiInfo, FiCheckCircle, FiPercent } from 'react-icons/fi';

const PLATFORM_FEE = 2.00;
const PLATFORM_PERCENT = 1.09;

const CARD_RATES = [
    { label: 'Crédito à vista', installments: '1x', pagarme: 3.19 },
    { label: 'Crédito parcelado', installments: '2–6x', pagarme: 4.49 },
    { label: 'Crédito parcelado', installments: '7–12x', pagarme: 4.99 },
    { label: 'Crédito parcelado', installments: '13–18x', pagarme: 4.99 },
];

const PIX_EXAMPLES = [10, 30, 50, 100, 250, 500];

function calcPix(sale: number) {
    const pagarme = sale * 0.0109;
    const platform = PLATFORM_FEE + sale * (PLATFORM_PERCENT / 100);
    return { pagarme, platform, seller: Math.max(0, sale - pagarme - platform) };
}

function calcCard(sale: number, pagarmeRate: number) {
    const pagarme = sale * (pagarmeRate / 100);
    const platform = PLATFORM_FEE + sale * (PLATFORM_PERCENT / 100);
    return { pagarme, platform, seller: Math.max(0, sale - pagarme - platform) };
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function FeesPage() {
    const [simValue, setSimValue] = useState(100);

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Taxas da Plataforma</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Transparência total nos seus recebíveis</p>
            </div>

            {/* Cards resumo — PIX e Cartão lado a lado */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>

                {/* PIX */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,206,201,0.08)' }}>
                            <FiZap size={24} color="#00cec9" />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#00cec9', background: 'rgba(0,206,201,0.1)', padding: '4px 10px', borderRadius: 20 }}>
                            Receba: Na hora
                        </span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Pix</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                        Recebimento instantâneo após confirmação do pagamento.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 10, background: 'rgba(0,206,201,0.06)', border: '1px solid rgba(0,206,201,0.15)' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Taxa por venda</span>
                        <span style={{ fontWeight: 800, fontSize: 18 }}>R$ 2,00 <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>+ 1,09%</span></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12 }}>
                        <FiInfo size={13} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            R$2,00 fixo + 1,09% sobre o valor da venda. Sem taxas ocultas.
                        </span>
                    </div>
                </div>

                {/* Cartão */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ padding: 12, borderRadius: 12, background: 'rgba(99,102,241,0.08)' }}>
                            <FiCreditCard size={24} color="#6366f1" />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '4px 10px', borderRadius: 20 }}>
                            Receba: Por parcela
                        </span>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Cartão de Crédito</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20 }}>
                        Taxa varia conforme o número de parcelas escolhido pelo comprador.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {CARD_RATES.map((r, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{r.label} <strong style={{ color: 'var(--text-primary)' }}>{r.installments}</strong></span>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontWeight: 800, fontSize: 15, color: '#6366f1' }}>{r.pagarme.toFixed(2).replace('.', ',')}%</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Pagar.me</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12 }}>
                        <FiInfo size={13} style={{ color: 'var(--text-muted)', marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Além da taxa do Pagar.me, incide R$2,00 + 1,09% da plataforma sobre cada venda.
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabela PIX */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <FiZap size={18} color="#00cec9" />
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Simulador de recebimento — PIX</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Valor da venda</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Taxa plataforma</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Taxa Pagar.me (1,09%)</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Você recebe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {PIX_EXAMPLES.map(sale => {
                                const { pagarme, platform, seller } = calcPix(sale);
                                return (
                                    <tr key={sale} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>R$ {fmt(sale)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--danger)' }}>R$ {fmt(platform)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>R$ {fmt(pagarme)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>R$ {fmt(seller)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 10, background: 'rgba(0,206,201,0.05)', border: '1px solid rgba(0,206,201,0.1)' }}>
                    <FiCheckCircle size={15} color="#00cec9" style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Taxa total PIX = <strong>R$2,00 fixo + 1,09% (plataforma) + 1,09% (Pagar.me)</strong> sobre o valor da venda.
                    </p>
                </div>
            </div>

            {/* Tabela Cartão com simulador */}
            <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <FiCreditCard size={18} color="#6366f1" />
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Simulador de recebimento — Cartão de Crédito</h3>
                </div>

                {/* Input simulador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', borderRadius: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <FiPercent size={16} color="#6366f1" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Valor da venda:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>R$</span>
                    <input
                        type="number" min={1} value={simValue}
                        onChange={e => setSimValue(Math.max(1, Number(e.target.value)))}
                        style={{ flex: 1, maxWidth: 160, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, outline: 'none' }}
                    />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Modalidade</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Taxa Pagar.me</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Taxa plataforma</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Total taxas</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Você recebe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CARD_RATES.map((rate, i) => {
                                const { pagarme, platform, seller } = calcCard(simValue, rate.pagarme);
                                const totalFee = simValue - seller;
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ fontWeight: 600 }}>{rate.installments}</span>
                                            <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 6 }}>{rate.label}</span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: '#6366f1', fontWeight: 600 }}>
                                            {rate.pagarme.toFixed(2).replace('.', ',')}% <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(R$ {fmt(pagarme)})</span>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--danger)' }}>R$ {fmt(platform)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)' }}>R$ {fmt(totalFee)}</td>
                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>R$ {fmt(seller)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: 16, display: 'flex', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 10, background: 'rgba(253,203,110,0.06)', border: '1px solid rgba(253,203,110,0.15)' }}>
                    <FiInfo size={14} style={{ color: '#FDCB6E', marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Taxa total cartão = <strong>Taxa Pagar.me (varia por parcelas) + R$2,00 + 1,09% da plataforma</strong>. O valor que você recebe já é o líquido após todas as deduções.
                    </p>
                </div>
            </div>
        </div>
    );
}
