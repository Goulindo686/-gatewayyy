'use client';

import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { FiDollarSign, FiTrendingUp, FiPackage, FiShoppingCart, FiArrowDown, FiPercent } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { useSearchParams } from 'next/navigation';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Filler, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

// TypeScript Interfaces
interface MonthlySale {
    month: string;
    amount: number;
    net_revenue?: number;
    fees?: number;
}

interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string | CanvasGradient;
    fill: boolean;
    tension: number;
    pointBackgroundColor: string;
    pointBorderColor: string;
    pointBorderWidth: number;
    pointRadius: number;
    pointHoverRadius?: number;
    pointHoverBorderWidth?: number;
}

interface ChartConfiguration {
    labels: string[];
    datasets: ChartDataset[];
}

// Helper function to calculate derived metrics
function calculateDerivedMetrics(monthlySales: MonthlySale[]): MonthlySale[] {
    return monthlySales.map(sale => ({
        ...sale,
        fees: sale.fees ?? sale.amount * 0.05,
        net_revenue: sale.net_revenue ?? sale.amount * 0.95,
    }));
}

/**
 * Creates a linear gradient for chart dataset background
 * @param ctx - Canvas rendering context (can be null)
 * @param color - Hex color string (e.g., '#6c5ce7')
 * @param opacity - Starting opacity value (0-1), defaults to 0.4
 * @returns CanvasGradient if context available, otherwise color string with opacity
 */
function createGradient(
    ctx: CanvasRenderingContext2D | null,
    color: string,
    opacity: number = 0.4
): string | CanvasGradient {
    // Fallback to solid color with opacity when context not available
    if (!ctx) {
        const opacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
        return `${color}${opacityHex}`;
    }

    // Create linear gradient from top (40% opacity) to bottom (0% opacity)
    const gradient = ctx.createLinearGradient(0, 0, 0, 340);
    const startOpacityHex = Math.round(opacity * 255).toString(16).padStart(2, '0');
    gradient.addColorStop(0, `${color}${startOpacityHex}`);
    gradient.addColorStop(1, `${color}00`);
    
    return gradient;
}

/**
 * Gets a CSS variable value from the document with fallback
 * @param variable - CSS variable name (e.g., '--bg-card')
 * @param fallback - Fallback value if variable not defined
 * @returns The CSS variable value or fallback
 */
function getThemeColor(variable: string, fallback: string): string {
    if (typeof window === 'undefined') return fallback;
    
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
    
    return value || fallback;
}

/**
 * Creates chart configuration with responsive options based on viewport
 * @param monthlySalesData - Array of monthly sales data with metrics
 * @param viewportWidth - Current viewport width in pixels
 * @returns Chart.js configuration object
 */
function createChartData(monthlySalesData: MonthlySale[], viewportWidth: number): ChartConfiguration {
    return {
        labels: monthlySalesData.map((m: any) => m.month),
        datasets: [
            {
                label: 'Vendas Brutas',
                data: monthlySalesData.map((m: any) => m.amount),
                borderColor: '#6c5ce7',
                backgroundColor: createGradient(null, '#6c5ce7', 0.4),
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6c5ce7',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Receita Líquida',
                data: monthlySalesData.map((m: any) => m.net_revenue),
                borderColor: '#00cec9',
                backgroundColor: createGradient(null, '#00cec9', 0.4),
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00cec9',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'Taxas Pagas',
                data: monthlySalesData.map((m: any) => m.fees),
                borderColor: '#ff6b6b',
                backgroundColor: createGradient(null, '#ff6b6b', 0.4),
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff6b6b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
            }
        ]
    };
}

/**
 * Creates responsive chart options based on viewport width
 * @param viewportWidth - Current viewport width in pixels
 * @returns Chart.js options configuration
 */
function createChartOptions(viewportWidth: number) {
    // Responsive font size: 20% smaller on screens < 640px
    const baseFontSize = viewportWidth < 640 ? 9.6 : 12;
    
    // Responsive legend position: bottom on mobile, top on desktop
    const legendPosition: 'bottom' | 'top' = viewportWidth < 768 ? 'bottom' : 'top';

    return {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500,
            easing: 'easeInOutQuart' as const,
        },
        plugins: {
            legend: {
                display: true,
                position: legendPosition,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle' as const,
                    font: {
                        size: baseFontSize,
                        family: 'Inter',
                        weight: '500',
                    },
                    color: getThemeColor('--text-secondary', '#55556a'),
                    generateLabels: (chart: any) => {
                        const datasets = chart.data.datasets;
                        return datasets.map((dataset: any, i: number) => {
                            const meta = chart.getDatasetMeta(i);
                            const isHidden = meta.hidden;
                            
                            return {
                                text: dataset.label,
                                fillStyle: dataset.borderColor,
                                strokeStyle: dataset.borderColor,
                                lineWidth: 2,
                                hidden: isHidden,
                                datasetIndex: i,
                                // Apply 50% opacity when dataset is hidden
                                fontColor: isHidden ? 'rgba(85, 85, 106, 0.5)' : getThemeColor('--text-secondary', '#55556a'),
                            };
                        });
                    },
                },
                onClick: (_e: any, legendItem: any, legend: any) => {
                    const index = legendItem.datasetIndex;
                    const chart = legend.chart;
                    const meta = chart.getDatasetMeta(index);
                    
                    // Toggle dataset visibility
                    meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : !meta.hidden;
                    
                    // Update chart to reflect changes
                    chart.update();
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: getThemeColor('--bg-card', '#16161f'),
                borderColor: getThemeColor('--border-color', '#2a2a3a'),
                borderWidth: 1,
                titleColor: getThemeColor('--text-primary', '#ffffff'),
                bodyColor: getThemeColor('--text-secondary', '#55556a'),
                padding: 12,
                cornerRadius: 10,
                callbacks: {
                    label: (ctx: any) => {
                        const label = ctx.dataset.label || '';
                        const value = ctx.parsed.y;
                        const formattedValue = value.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                        return `${label}: R$ ${formattedValue}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: `rgba(${getThemeColor('--border-color-rgb', '42, 42, 58')}, 0.2)`,
                    lineWidth: 1,
                    drawBorder: false,
                    drawTicks: false,
                    borderDash: [5, 5],
                },
                ticks: { 
                    color: getThemeColor('--text-muted', '#55556a'), 
                    font: { size: baseFontSize } 
                }
            },
            y: {
                grid: {
                    color: `rgba(${getThemeColor('--border-color-rgb', '42, 42, 58')}, 0.2)`,
                    lineWidth: 1,
                    drawBorder: false,
                    drawTicks: false,
                    borderDash: [5, 5],
                },
                ticks: { 
                    color: getThemeColor('--text-muted', '#55556a'), 
                    font: { size: baseFontSize }, 
                    callback: (v: any) => `R${v}` 
                }
            }
        }
    };
}

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<{ monthly_sales: any[]; recent_orders: any[] } | null>(null);
    const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const searchParams = useSearchParams();

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        const start = searchParams.get('start') || undefined;
        const end = searchParams.get('end') || undefined;
        if (start || end) {
            loadPeriod({ start, end });
        } else {
            setPeriod(null);
            loadStats();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Responsive resize listener with throttling (300ms debounce)
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setViewportWidth(window.innerWidth);
            }, 300);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const loadStats = async (params?: any) => {
        setLoading(true);
        try {
            const { data } = await dashboardAPI.getStats(params || {});
            setStats(data);
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    };
    
    const loadPeriod = async (params?: any) => {
        try {
            const { data } = await dashboardAPI.getStats(params || {});
            setPeriod({
                monthly_sales: data?.monthly_sales || [],
                recent_orders: data?.recent_orders || []
            });
        } catch (err) {
            console.error('Failed to load period stats:', err);
        }
    };

    // Get monthly sales data with derived metrics
    const monthlySalesData = calculateDerivedMetrics(period?.monthly_sales || stats?.monthly_sales || []);

    // Responsive chart height: 250px for mobile (< 768px), 340px for desktop
    const chartHeight = viewportWidth < 768 ? 250 : 340;

    // Create chart data and options with responsive configuration
    const chartData = createChartData(monthlySalesData, viewportWidth);
    const chartOptions = createChartOptions(viewportWidth);

    const statCards = [
        { label: 'Saldo Disponível', value: stats?.stats?.available_balance || '0.00', icon: <FiDollarSign size={20} />, color: '#00cec9' },
        { label: 'Total Vendido', value: stats?.stats?.total_sold || '0.00', icon: <FiTrendingUp size={20} />, color: '#6c5ce7' },
        { label: 'A Receber', value: stats?.stats?.pending_balance || '0.00', icon: <FiShoppingCart size={20} />, color: '#fdcb6e' },
        { label: 'Total Sacado', value: stats?.stats?.total_withdrawn || '0.00', icon: <FiArrowDown size={20} />, color: '#74b9ff' },
        { label: 'Taxas Pagas', value: stats?.stats?.total_fees || '0.00', icon: <FiPercent size={20} />, color: '#ff6b6b' },
        { label: 'Produtos', value: stats?.stats?.total_products || 0, icon: <FiPackage size={20} />, color: '#a29bfe', isCurrency: false },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 40, height: 40, border: '3px solid var(--border-color)',
                        borderTopColor: 'var(--accent-primary)', borderRadius: '50%',
                        animation: 'spin 1s linear infinite', margin: '0 auto 16px'
                    }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Carregando dashboard...</p>
                    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Visão geral do seu negócio</p>
            </div>

            <div className="dashboardBanner">
                <img
                    src="https://i.imgur.com/lHeTUiJ.jpeg"
                    alt="Banner do Dashboard"
                    loading="eager"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://i.imgur.com/20tNSps.jpg';
                    }}
                    className="dashboardBannerImg"
                />
            </div>

            <style>{`
                .dashboardBanner {
                    border-radius: 18px;
                    overflow: hidden;
                    border: 1px solid var(--border-color);
                    background: var(--bg-card);
                    margin-bottom: 24px;
                    height: clamp(160px, 20vw, 260px);
                    position: relative;
                }

                .dashboardBannerImg {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    object-position: right 32%;
                    display: block;
                }

                @media (max-width: 640px) {
                    .dashboardBanner {
                        display: none;
                    }
                }
            `}</style>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
                {statCards.map((card, i) => (
                    <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 10,
                                background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: card.color
                            }}>{card.icon}</div>
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
                            {card.isCurrency !== false ? `R$ ${card.value}` : card.value}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 24, marginBottom: 32
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Vendas por Mês</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Receita acumulada nos últimos meses</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#6c5ce7' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Vendas (R$)</span>
                    </div>
                </div>
                <div style={{ height: chartHeight, transition: 'opacity 300ms ease-in-out' }}>
                    {monthlySalesData.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: 'var(--text-muted)'
                        }}>
                            <FiTrendingUp size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                            <p style={{ fontSize: 14, textAlign: 'center' }}>
                                Nenhum dado de vendas disponível para o período selecionado
                            </p>
                        </div>
                    ) : (
                        <Line data={chartData} options={chartOptions as any} />
                    )}
                </div>
            </div>

            {/* Recent Orders */}
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                borderRadius: 16, padding: 24
            }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Vendas Recentes</h3>
                {stats?.recent_orders?.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Produto</th>
                                    <th>Comprador</th>
                                    <th>Valor</th>
                                    <th>Método</th>
                                    <th>Status</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                {(period?.recent_orders || stats?.recent_orders || []).map((order: any) => (
                                    <tr key={order.id}>
                                        <td style={{ fontWeight: 500 }}>{order.product_name || order.products?.name || '—'}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{order.buyer_name || '—'}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--success)' }}>R$ {order.amount_display}</td>
                                        <td>
                                            <span className={`badge ${order.payment_method === 'pix' ? 'badge-success' : 'badge-info'}`}>
                                                {order.payment_method === 'pix' ? 'PIX' : 'Cartão'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${order.status === 'paid' ? 'badge-success' :
                                                order.status === 'pending' ? 'badge-warning' :
                                                    order.status === 'failed' ? 'badge-danger' : 'badge-neutral'
                                                }`}>
                                                {order.status === 'paid' ? 'Pago' :
                                                    order.status === 'pending' ? 'Pendente' :
                                                        order.status === 'failed' ? 'Falhou' : order.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                        <FiShoppingCart size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
                        <p>Nenhuma venda ainda. Crie um produto e compartilhe o link de checkout!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
