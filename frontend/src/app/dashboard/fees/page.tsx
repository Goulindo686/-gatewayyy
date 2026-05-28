'use client';

import { useState } from 'react';
import { FiZap, FiCreditCard } from 'react-icons/fi';

// Taxa fixa da plataforma em todas as vendas
const PLATFORM_FIXED = 2.00;
const PLATFORM_PERCENT = 1.09;

// Taxas do cartão por modalidade (já incluem tudo — vendedor só vê o total)
const CARD_RATES = [
    { label: 'À vista', installments: '1x',    rate: 3.19 + PLATFORM_PERCENT },
    { label: 'Parcelado', installments: '2–6x',  rate: 4.49 + PLATFORM_PERCENT },
    { label: 'Parcelado', installments: '7–12x', rate: 4.99 + PLATFORM_PERCENT },
    { label: 'Parcelado', installments: '13–18x',rate: 4.99 + PLATFORM_PERCENT },
];

const PIX_EXAMPLES  = [10, 30, 50, 100, 250, 500];
const CARD_EXAMPLES = [50, 100, 200, 500, 1000];

const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function FeesPage() {
    const [cardSim, setCardSim] = useState(100);

    return (
        <div className="animate-fade-in" style={{ maxWidth: 860 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Taxas da Plataforma</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    Veja exatamente quanto você recebe em cada venda.
                </p>
            </div>

            {/* ── TABELA PIX ── */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <FiZap size={20} color="#00cec9" />
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>PIX</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Taxa: <strong>R$ 2,00 fixo + 1,09%</strong> sobre o valor da venda.
                </p>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ textAlign: 'left',  padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Valor da venda</th>
                            <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Taxa cobrada</th>
                            <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Você recebe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {PIX_EXAMPLES.map(sale => {
                            const fee    = PLATFORM_FIXED + sale * (PLATFORM_PERCENT / 100);
                            const seller = Math.max(0, sale - fee);
                            return (
                                <tr key={sale} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '13px 12px', fontWeight: 600 }}>R$ {fmt(sale)}</td>
                                    <td style={{ padding: '13px 12px', textAlign: 'right', color: 'var(--danger)' }}>− R$ {fmt(fee)}</td>
                                    <td style={{ padding: '13px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>R$ {fmt(seller)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── TABELA CARTÃO ── */}
            <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <FiCreditCard size={20} color="#6366f1" />
                    <h2 style={{ fontSize: 18, fontWeight: 700 }}>Cartão de Crédito</h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                    Taxa: <strong>R$ 2,00 fixo</strong> + percentual conforme o parcelamento.
                </p>

                {/* Tabela de taxas por modalidade */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginBottom: 28 }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                            <th style={{ textAlign: 'left',  padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Modalidade</th>
                            <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Taxa total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CARD_RATES.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '13px 12px', fontWeight: 600 }}>
                                    {r.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{r.installments}</span>
                                </td>
                                <td style={{ padding: '13px 12px', textAlign: 'right', fontWeight: 700, color: '#6366f1' }}>
                                    R$ 2,00 + {r.rate.toFixed(2).replace('.', ',')}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Simulador */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 24 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>
                        Simulador — quanto você recebe
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Valor da venda:</span>
                        <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>R$</span>
                        <input
                            type="number" min={1} value={cardSim}
                            onChange={e => setCardSim(Math.max(1, Number(e.target.value)))}
                            style={{
                                width: 140, padding: '8px 12px', borderRadius: 8,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                fontSize: 15, fontWeight: 700, outline: 'none'
                            }}
                        />
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                <th style={{ textAlign: 'left',  padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Modalidade</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Taxa cobrada</th>
                                <th style={{ textAlign: 'right', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: 500 }}>Você recebe</th>
                            </tr>
                        </thead>
                        <tbody>
                            {CARD_RATES.map((r, i) => {
                                const fee    = PLATFORM_FIXED + cardSim * (r.rate / 100);
                                const seller = Math.max(0, cardSim - fee);
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '13px 12px', fontWeight: 600 }}>
                                            {r.label} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{r.installments}</span>
                                        </td>
                                        <td style={{ padding: '13px 12px', textAlign: 'right', color: 'var(--danger)' }}>− R$ {fmt(fee)}</td>
                                        <td style={{ padding: '13px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>R$ {fmt(seller)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
