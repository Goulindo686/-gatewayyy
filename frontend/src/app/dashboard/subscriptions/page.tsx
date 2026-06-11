'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import {
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiEye,
    FiFilter,
    FiHelpCircle,
    FiRefreshCw,
    FiRepeat,
    FiSearch,
    FiTrash2,
    FiUsers,
} from 'react-icons/fi';

const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Ativa', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)' },
    pending: { label: 'Pendente', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.14)' },
    past_due: { label: 'Em atraso', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.14)' },
    canceled: { label: 'Cancelada', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.14)' },
};

export default function SubscriptionsPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState('');
    const [period, setPeriod] = useState('always');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setRefreshing(true);
        try {
            const [plansRes, subsRes] = await Promise.all([
                api.get('/subscriptions/plans'),
                api.get('/subscriptions')
            ]);
            setPlans(plansRes.data.plans || []);
            setSubscriptions(subsRes.data.subscriptions || []);
        } catch {
            toast.error('Erro ao carregar dados');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Desativar este plano? Assinaturas existentes nao serao afetadas.')) return;
        try {
            await api.delete(`/subscriptions/plans/${id}`);
            toast.success('Plano desativado');
            loadData();
        } catch {
            toast.error('Erro ao desativar plano');
        }
    };

    const handleCancelSub = async (id: string) => {
        if (!confirm('Cancelar esta assinatura? O cliente perdera o acesso no proximo ciclo.')) return;
        try {
            await api.post(`/subscriptions/${id}/cancel`);
            toast.success('Assinatura cancelada');
            loadData();
        } catch {
            toast.error('Erro ao cancelar assinatura');
        }
    };

    const fmtBRL = (cents: number) => `R$ ${(Number(cents || 0) / 100).toFixed(2).replace('.', ',')}`;
    const fmtInterval = (interval: string, count: number) => {
        const map: Record<string, string> = { week: 'semana', month: 'mes', year: 'ano' };
        return Number(count || 1) > 1 ? `a cada ${count} ${map[interval] || interval}s` : `por ${map[interval] || interval}`;
    };

    const filteredSubscriptions = useMemo(() => {
        const now = new Date();
        const periodStart = new Date(now);
        if (period === '7d') periodStart.setDate(now.getDate() - 7);
        if (period === '30d') periodStart.setDate(now.getDate() - 30);
        if (period === '90d') periodStart.setDate(now.getDate() - 90);

        return subscriptions.filter((sub) => {
            const term = query.trim().toLowerCase();
            const matchesSearch = !term || [
                sub.customer_name,
                sub.customer_email,
                sub.subscription_plans?.name,
                sub.status,
            ].some((value) => String(value || '').toLowerCase().includes(term));

            const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
            const createdAt = sub.created_at ? new Date(sub.created_at) : null;
            const matchesPeriod = period === 'always' || (createdAt && createdAt >= periodStart);

            return matchesSearch && matchesStatus && matchesPeriod;
        });
    }, [subscriptions, query, statusFilter, period]);

    const activePlans = plans.filter((p) => p.status === 'active');
    const activeSubs = subscriptions.filter((sub) => sub.status === 'active');
    const renewals = subscriptions.filter((sub) => sub.status === 'active' && sub.current_period_end).length;
    const recurringRevenue = activeSubs.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
    const lifetimeValue = subscriptions.reduce((sum, sub) => sum + Number(sub.amount || 0), 0);
    const canceled = subscriptions.filter((sub) => sub.status === 'canceled').length;
    const churnRate = subscriptions.length ? Math.round((canceled / subscriptions.length) * 100) : 0;

    const metrics = [
        { label: 'Ativas', helper: 'Assinaturas ativas no momento', value: activeSubs.length, sideLabel: 'Comissao', sideValue: fmtBRL(recurringRevenue), accent: '#22c55e' },
        { label: 'Renovacoes', helper: 'Assinaturas com proxima cobranca', value: renewals, sideLabel: 'Comissao', sideValue: fmtBRL(recurringRevenue), accent: '#22c55e' },
        { label: 'LTV', helper: 'Valor total em assinaturas', value: fmtBRL(lifetimeValue), accent: '#22c55e' },
        { label: 'MRR', helper: 'Receita mensal recorrente estimada', value: fmtBRL(recurringRevenue), accent: '#facc15' },
        { label: 'Churn Rate', helper: 'Percentual de assinaturas canceladas', value: `${churnRate}%`, accent: '#ff5630' },
    ];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="subscriptions-shell">
            <header className="subscriptions-header">
                <div>
                    <h1>Assinaturas</h1>
                    <p>Ultima atualizacao: menos de um minuto</p>
                </div>
                <div className="header-actions">
                    <label className="period-select">
                        <span>Periodo</span>
                        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                            <option value="always">Sempre</option>
                            <option value="7d">Ultimos 7 dias</option>
                            <option value="30d">Ultimos 30 dias</option>
                            <option value="90d">Ultimos 90 dias</option>
                        </select>
                        <FiChevronDown />
                    </label>
                    <button className="refresh-button" onClick={loadData} disabled={refreshing}>
                        Atualizar <FiRefreshCw className={refreshing ? 'spinning' : ''} />
                    </button>
                </div>
            </header>

            <section className="metrics-grid">
                {metrics.map((metric, index) => (
                    <article key={metric.label} className={`metric-card metric-${index + 1}`} style={{ '--accent': metric.accent } as any}>
                        <div className="metric-content">
                            <div>
                                <span className="metric-label">{metric.label} <FiHelpCircle /></span>
                                <strong>{metric.value}</strong>
                            </div>
                            {metric.sideLabel && (
                                <div>
                                    <span className="metric-label">{metric.sideLabel}</span>
                                    <strong>{metric.sideValue}</strong>
                                </div>
                            )}
                        </div>
                        <button aria-label={metric.helper} title={metric.helper} className="metric-eye"><FiEye /></button>
                    </article>
                ))}
            </section>

            <section className="plans-strip">
                <div className="section-title">
                    <div>
                        <span>Planos ativos</span>
                        <strong>{activePlans.length}</strong>
                    </div>
                    <FiRepeat />
                </div>
                {activePlans.length === 0 ? (
                    <div className="empty-inline">Nenhum plano criado ainda</div>
                ) : (
                    <div className="plan-list">
                        {activePlans.map((plan) => (
                            <article key={plan.id} className="plan-pill">
                                <div>
                                    <strong>{plan.name}</strong>
                                    <span>{fmtBRL(plan.amount)} - {fmtInterval(plan.interval, plan.interval_count)}</span>
                                </div>
                                <button onClick={() => handleDeletePlan(plan.id)} title="Desativar plano">
                                    <FiTrash2 />
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="table-card">
                <div className="table-toolbar">
                    <div className="search-box">
                        <FiSearch />
                        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pesquisar" />
                    </div>
                    <label className="filter-button">
                        <FiFilter />
                        <span>Filtros</span>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Todos</option>
                            <option value="active">Ativas</option>
                            <option value="pending">Pendentes</option>
                            <option value="past_due">Em atraso</option>
                            <option value="canceled">Canceladas</option>
                        </select>
                    </label>
                </div>

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th><span className="check-box" /></th>
                                <th>Data</th>
                                <th>Plano</th>
                                <th>Produto</th>
                                <th>Membro</th>
                                <th>Comissao</th>
                                <th>Renova em</th>
                                <th>Status</th>
                                <th>Acoes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={9}>
                                        <div className="empty-state">
                                            <FiUsers />
                                            <span>Nenhum registro encontrado</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredSubscriptions.map((sub) => {
                                const st = statusLabel[sub.status] || { label: sub.status, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.14)' };
                                return (
                                    <tr key={sub.id}>
                                        <td><span className="check-box" /></td>
                                        <td>{sub.created_at ? new Date(sub.created_at).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td>{sub.subscription_plans?.name || '-'}</td>
                                        <td>{sub.product_name || sub.subscription_plans?.product_name || '-'}</td>
                                        <td>
                                            <strong>{sub.customer_name || 'Cliente'}</strong>
                                            <span>{sub.customer_email}</span>
                                        </td>
                                        <td>{fmtBRL(sub.amount)}</td>
                                        <td>{sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td><span className="status-pill" style={{ background: st.bg, color: st.color }}>{st.label}</span></td>
                                        <td>
                                            {sub.status !== 'canceled' ? (
                                                <button className="cancel-button" onClick={() => handleCancelSub(sub.id)}>Cancelar</button>
                                            ) : (
                                                <span className="muted-action">-</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <footer className="table-footer">
                    <button><FiChevronLeft /></button>
                    <span>1</span>
                    <button><FiChevronRight /></button>
                </footer>
            </section>

            <style jsx>{`
                .subscriptions-shell {
                    background: #111922;
                    color: #f8fafc;
                    border-radius: 24px;
                    padding: 30px;
                    min-height: calc(100vh - 150px);
                    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08);
                }
                .subscriptions-header {
                    display: flex;
                    justify-content: space-between;
                    gap: 20px;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                h1 {
                    font-size: 27px;
                    font-weight: 850;
                    margin: 0 0 8px;
                    letter-spacing: 0;
                }
                .subscriptions-header p {
                    color: #93a8c5;
                    font-size: 13px;
                    margin: 0;
                }
                .header-actions {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .period-select {
                    position: relative;
                    display: flex;
                    align-items: center;
                    min-width: 112px;
                    height: 48px;
                    border: 1px solid rgba(148, 163, 184, 0.28);
                    border-radius: 9px;
                    background: #121d29;
                    color: #fff;
                    padding: 16px 32px 4px 13px;
                }
                .period-select span {
                    position: absolute;
                    top: -8px;
                    left: 12px;
                    padding: 0 5px;
                    background: #111922;
                    color: #879bb8;
                    font-size: 12px;
                }
                .period-select select {
                    appearance: none;
                    width: 100%;
                    border: 0;
                    outline: 0;
                    background: transparent;
                    color: #fff;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .period-select option {
                    color: #0f172a;
                }
                .period-select svg {
                    position: absolute;
                    right: 10px;
                    pointer-events: none;
                    color: #9badc5;
                }
                .refresh-button {
                    height: 48px;
                    border: 0;
                    border-radius: 8px;
                    background: #354252;
                    color: #b8c6d8;
                    padding: 0 28px;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                .refresh-button:disabled {
                    opacity: 0.7;
                    cursor: wait;
                }
                .spinning {
                    animation: spin 0.8s linear infinite;
                }
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                    margin-bottom: 30px;
                }
                .metric-card {
                    position: relative;
                    border-radius: 14px;
                    background: #1d2a38;
                    border-left: 3px solid var(--accent);
                    min-height: 90px;
                    padding: 20px 18px;
                    overflow: hidden;
                }
                .metric-1,
                .metric-2 {
                    grid-column: span 3;
                }
                .metric-3,
                .metric-4,
                .metric-5 {
                    grid-column: span 2;
                }
                .metric-content {
                    display: flex;
                    gap: 48px;
                    align-items: flex-start;
                }
                .metric-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    color: #94a8c4;
                    font-size: 14px;
                    font-weight: 750;
                    margin-bottom: 8px;
                }
                .metric-card strong {
                    display: block;
                    font-size: 25px;
                    line-height: 1;
                    color: #fff;
                    letter-spacing: 0;
                }
                .metric-eye {
                    position: absolute;
                    right: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: 0;
                    background: transparent;
                    color: #c9d4e2;
                    display: inline-flex;
                    cursor: help;
                }
                .plans-strip {
                    background: #1d2a38;
                    border-radius: 14px;
                    padding: 18px;
                    margin-bottom: 18px;
                }
                .section-title {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 14px;
                    color: #94a8c4;
                }
                .section-title div {
                    display: flex;
                    align-items: baseline;
                    gap: 10px;
                }
                .section-title strong {
                    color: #fff;
                    font-size: 22px;
                }
                .plan-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                    gap: 10px;
                }
                .plan-pill {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    align-items: center;
                    border: 1px solid rgba(148, 163, 184, 0.16);
                    border-radius: 12px;
                    padding: 12px 14px;
                    background: rgba(15, 23, 42, 0.28);
                }
                .plan-pill strong {
                    display: block;
                    font-size: 14px;
                    margin-bottom: 3px;
                }
                .plan-pill span,
                .empty-inline {
                    color: #94a8c4;
                    font-size: 12px;
                }
                .plan-pill button {
                    border: 0;
                    width: 34px;
                    height: 34px;
                    border-radius: 9px;
                    background: rgba(255, 86, 48, 0.12);
                    color: #fb7185;
                    display: inline-grid;
                    place-items: center;
                    cursor: pointer;
                }
                .table-card {
                    overflow: hidden;
                    border-radius: 16px;
                    background: #1d2a38;
                }
                .table-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                }
                .search-box {
                    width: min(100%, 250px);
                    height: 40px;
                    border: 1px solid rgba(148, 163, 184, 0.32);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 14px;
                    color: #89a0bd;
                    background: #1a2734;
                }
                .search-box input {
                    min-width: 0;
                    width: 100%;
                    border: 0;
                    outline: 0;
                    background: transparent;
                    color: #dbe7f7;
                    font-size: 15px;
                }
                .search-box input::placeholder {
                    color: #6f85a2;
                }
                .filter-button {
                    position: relative;
                    height: 38px;
                    border: 1px solid rgba(148, 163, 184, 0.3);
                    border-radius: 8px;
                    padding: 0 12px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: #fff;
                    font-weight: 800;
                    cursor: pointer;
                    background: #1a2734;
                }
                .filter-button select {
                    position: absolute;
                    inset: 0;
                    opacity: 0;
                    cursor: pointer;
                }
                .table-wrap {
                    overflow-x: auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    min-width: 920px;
                }
                th {
                    background: #334150;
                    color: #9fb3cf;
                    text-align: left;
                    font-size: 13px;
                    font-weight: 800;
                    padding: 18px;
                }
                td {
                    border-top: 1px solid rgba(148, 163, 184, 0.08);
                    color: #cbd7e6;
                    font-size: 13px;
                    padding: 16px 18px;
                    vertical-align: middle;
                }
                td strong {
                    display: block;
                    color: #f8fafc;
                    font-size: 13px;
                    margin-bottom: 3px;
                }
                td span {
                    color: #8498b4;
                    font-size: 12px;
                }
                .check-box {
                    display: inline-block;
                    width: 18px;
                    height: 18px;
                    border: 2px solid #8aa0ba;
                    border-radius: 5px;
                }
                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    min-height: 25px;
                    border-radius: 999px;
                    padding: 4px 10px;
                    font-size: 12px;
                    font-weight: 850;
                }
                .cancel-button {
                    border: 0;
                    border-radius: 8px;
                    background: rgba(255, 86, 48, 0.13);
                    color: #fb7185;
                    height: 32px;
                    padding: 0 12px;
                    font-weight: 800;
                    cursor: pointer;
                }
                .muted-action {
                    color: #7488a4;
                }
                .empty-state {
                    min-height: 92px;
                    display: grid;
                    place-items: center;
                    gap: 8px;
                    color: #9fb3cf;
                }
                .empty-state svg {
                    opacity: 0.55;
                    font-size: 24px;
                }
                .table-footer {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 0;
                }
                .table-footer button {
                    width: 28px;
                    height: 28px;
                    border: 0;
                    border-radius: 50%;
                    background: transparent;
                    color: #8ea2bd;
                    display: inline-grid;
                    place-items: center;
                }
                .table-footer span {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #0f8f7b;
                    color: #fff;
                    display: inline-grid;
                    place-items: center;
                    font-weight: 800;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 980px) {
                    .subscriptions-shell {
                        padding: 20px;
                        border-radius: 18px;
                    }
                    .subscriptions-header {
                        flex-direction: column;
                    }
                    .metrics-grid {
                        grid-template-columns: 1fr;
                    }
                    .metric-1,
                    .metric-2,
                    .metric-3,
                    .metric-4,
                    .metric-5 {
                        grid-column: auto;
                    }
                    .metric-content {
                        gap: 24px;
                    }
                }
                @media (max-width: 640px) {
                    .subscriptions-shell {
                        margin: -6px;
                        padding: 16px;
                    }
                    h1 {
                        font-size: 24px;
                    }
                    .header-actions,
                    .table-toolbar {
                        width: 100%;
                        align-items: stretch;
                        flex-direction: column;
                    }
                    .period-select,
                    .refresh-button,
                    .search-box,
                    .filter-button {
                        width: 100%;
                    }
                    .metric-card {
                        min-height: 84px;
                    }
                    .metric-card strong {
                        font-size: 23px;
                    }
                    .metric-content {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
}
