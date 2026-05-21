'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { FiSearch, FiShield } from 'react-icons/fi';

export default function AdminAdminsPage() {
    const [admins, setAdmins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { loadAdmins(); }, []);

    const loadAdmins = async (s?: string) => {
        try {
            const { data } = await adminAPI.listAdmins({ search: s || search });
            setAdmins(data.admins || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        loadAdmins(search);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
                <div style={{ width: 36, height: 36, border: '3px solid var(--border-color)', borderTopColor: '#ff6b6b', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admins</h1>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={15} />
                        <input className="input-field" placeholder="Buscar por nome ou email" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40, width: 280 }} />
                    </div>
                    <button type="submit" className="btn-secondary" style={{ padding: '10px 20px' }}>Buscar</button>
                </form>
            </div>

            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                {admins.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr><th>Nome</th><th>Email</th><th>Status</th><th>Cadastro</th></tr>
                            </thead>
                            <tbody>
                                {admins.map((a: any) => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 500 }}>{a.name}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{a.email}</td>
                                        <td>
                                            <span className={`badge ${a.status === 'active' ? 'badge-success' : a.status === 'blocked' ? 'badge-danger' : 'badge-warning'}`}>
                                                {a.status === 'active' ? 'Ativo' : a.status === 'blocked' ? 'Bloqueado' : a.status}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
                        <FiShield size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
                        <p>Nenhum admin encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
}

