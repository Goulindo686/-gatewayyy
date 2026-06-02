'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiClock, FiMail, FiPackage, FiSave, FiZap } from 'react-icons/fi';

type RecoverySetting = {
    enabled: boolean;
    delay_minutes: number;
};

type RecoveryProduct = {
    id: string;
    name: string;
    price_display: string;
    reminders_sent: number;
    recovery: RecoverySetting;
};

function errorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}

export default function SalesRecoveryPage() {
    const [products, setProducts] = useState<RecoveryProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);

    const loadProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/sales-recovery', { headers: { Authorization: `Bearer ${token}` } });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setProducts(data.products || []);
        } catch (error: unknown) {
            toast.error(errorMessage(error) || 'Erro ao carregar produtos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProducts(); }, []);

    const updateRecovery = (productId: string, field: string, value: boolean | number) => {
        setProducts(current => current.map(product => product.id === productId
            ? { ...product, recovery: { ...product.recovery, [field]: value } }
            : product));
    };

    const save = async (product: RecoveryProduct) => {
        setSavingId(product.id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/sales-recovery', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ product_id: product.id, enabled: product.recovery.enabled, delay_minutes: Number(product.recovery.delay_minutes) }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            toast.success('Recuperacao de vendas atualizada');
            setProducts(current => current.map(item => item.id === product.id ? { ...item, recovery: data.setting } : item));
        } catch (error: unknown) {
            toast.error(errorMessage(error) || 'Erro ao salvar configuracao');
        } finally {
            setSavingId(null);
        }
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>Carregando...</div>;

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Recuperacao de Vendas</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 760, lineHeight: 1.6 }}>
                    Envie automaticamente um lembrete com o QR Code Pix original quando um cliente gerar o pagamento e nao concluir a compra.
                </p>
            </div>
            <div className="glass-card" style={{ padding: 20, marginBottom: 22, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <FiZap size={20} style={{ color: 'var(--accent-secondary)', flexShrink: 0 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
                    Ative por produto e escolha o intervalo. Pedidos pagos ou expirados sao ignorados, e cada pedido pendente recebe somente um lembrete.
                </p>
            </div>
            {products.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: 56 }}>
                    <FiPackage size={42} style={{ opacity: 0.3, marginBottom: 12 }} />
                    <p>Crie um produto na aba Produtos para ativar esta funcao.</p>
                </div>
            ) : <div style={{ display: 'grid', gap: 14 }}>
                {products.map(product => (
                    <div key={product.id} className="glass-card recovery-card" style={{ padding: 20, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 18, alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{product.name}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                R$ {String(product.price_display).replace('.', ',')} | <FiMail size={12} style={{ verticalAlign: -2 }} /> {product.reminders_sent} lembretes enviados
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                                <FiClock size={15} />
                                <select className="input-field" value={product.recovery.delay_minutes} onChange={event => updateRecovery(product.id, 'delay_minutes', Number(event.target.value))} style={{ width: 150, padding: 9 }}>
                                    <option value={15}>apos 15 minutos</option><option value={30}>apos 30 minutos</option><option value={60}>apos 1 hora</option><option value={180}>apos 3 horas</option><option value={360}>apos 6 horas</option><option value={720}>apos 12 horas</option><option value={1440}>apos 24 horas</option>
                                </select>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700 }}>
                                <input type="checkbox" checked={product.recovery.enabled} onChange={event => updateRecovery(product.id, 'enabled', event.target.checked)} style={{ width: 18, height: 18 }} />
                                {product.recovery.enabled ? 'Ativada' : 'Desativada'}
                            </label>
                            <button className="btn-primary" onClick={() => save(product)} disabled={savingId === product.id} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px' }}>
                                <FiSave size={14} /> {savingId === product.id ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>}
            <style jsx>{`@media (max-width: 780px) { .recovery-card { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}
