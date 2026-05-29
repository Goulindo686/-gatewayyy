'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, withdrawalsAPI } from '@/lib/api';
import { FiArrowRight, FiCheckCircle, FiX, FiUser, FiShield } from 'react-icons/fi';

type Step = 'profile' | 'verify' | 'done';

export default function OnboardingBar() {
    const router = useRouter();
    const [step, setStep] = useState<Step | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const check = async () => {
            try {
                // Verifica se o usuário já dispensou a barra nesta sessão
                const key = 'onboarding_dismissed';
                if (sessionStorage.getItem(key)) { setDismissed(true); return; }

                const { data: profileData } = await authAPI.getProfile();
                const u = profileData.user;

                // Admin não precisa de onboarding
                if (u.role === 'admin') return;

                // Etapa 1: dados básicos não preenchidos
                const hasProfile = !!(u.name && u.cpf_cnpj && u.pix_key && u.bank_name && u.bank_agency && u.bank_account);
                if (!hasProfile) { setStep('profile'); return; }

                // Etapa 2: dados preenchidos mas verificação pendente
                try {
                    const { data: balanceData } = await withdrawalsAPI.getBalance();
                    if (balanceData?.recipient_status !== 'active') {
                        setStep('verify');
                    } else {
                        setStep('done');
                    }
                } catch {
                    setStep('verify');
                }
            } catch {
                // silencioso — não quebra o layout
            }
        };
        check();
    }, []);

    const dismiss = () => {
        sessionStorage.setItem('onboarding_dismissed', '1');
        setDismissed(true);
    };

    if (dismissed || step === null || step === 'done') return null;

    const isProfile = step === 'profile';

    const config = {
        profile: {
            icon: <FiUser size={16} />,
            bg: 'linear-gradient(90deg, rgba(108,92,231,0.18) 0%, rgba(108,92,231,0.08) 100%)',
            border: 'rgba(108,92,231,0.3)',
            accent: '#a29bfe',
            badge: 'Passo 1 de 2',
            title: 'Complete seu cadastro para começar a receber',
            desc: 'Preencha seus dados pessoais, bancários e chave Pix na aba Configurações.',
            btnLabel: 'Ir para Configurações',
            btnBg: '#6c5ce7',
            onClick: () => router.push('/dashboard/settings'),
        },
        verify: {
            icon: <FiShield size={16} />,
            bg: 'linear-gradient(90deg, rgba(255,171,0,0.15) 0%, rgba(255,171,0,0.06) 100%)',
            border: 'rgba(255,171,0,0.3)',
            accent: '#fdcb6e',
            badge: 'Passo 2 de 2',
            title: 'Finalize sua verificação de identidade',
            desc: 'Clique no botão amarelo na aba Saques para verificar sua identidade e liberar os saques.',
            btnLabel: 'Ir para Saques',
            btnBg: '#e17055',
            onClick: () => router.push('/dashboard/withdrawals'),
        },
    };

    const c = config[step];

    return (
        <div style={{
            background: c.bg,
            borderBottom: `1px solid ${c.border}`,
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 20,
        }}>
            {/* Progresso visual */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {/* Passo 1 */}
                <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: isProfile ? c.accent : 'rgba(85,239,196,0.9)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                }}>
                    {isProfile ? '1' : <FiCheckCircle size={13} />}
                </div>
                <div style={{ width: 20, height: 2, background: isProfile ? 'rgba(255,255,255,0.15)' : c.accent, borderRadius: 2 }} />
                {/* Passo 2 */}
                <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: !isProfile ? c.accent : 'rgba(255,255,255,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff',
                }}>
                    2
                </div>
            </div>

            {/* Badge */}
            <span style={{
                fontSize: 11, fontWeight: 700, color: c.accent,
                background: `${c.accent}22`, padding: '3px 10px', borderRadius: 20,
                flexShrink: 0,
            }}>
                {c.badge}
            </span>

            {/* Texto */}
            <div style={{ flex: 1, minWidth: 200 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginRight: 8 }}>
                    {c.title}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {c.desc}
                </span>
            </div>

            {/* Botão de ação */}
            <button
                onClick={c.onClick}
                style={{
                    background: c.btnBg, color: '#fff', border: 'none',
                    borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    flexShrink: 0, whiteSpace: 'nowrap',
                }}
            >
                {c.btnLabel} <FiArrowRight size={14} />
            </button>

            {/* Fechar */}
            <button
                onClick={dismiss}
                title="Dispensar"
                style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: 4, flexShrink: 0,
                }}
            >
                <FiX size={16} />
            </button>
        </div>
    );
}
