'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiMail } from 'react-icons/fi';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [email, setEmail] = useState('');
    const brandLogo = 'https://i.imgur.com/vXgH6Mn.png';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/forgot-password', { email });
            setSent(true);
            toast.success('Email de recuperacao enviado!');
        } catch {
            toast.error('Erro ao enviar email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="authShell">
            <div className="authBackdrop" />
            <div className="authLayout">
                <div className="authSide">
                    <div className="authSideInner">
                        <div className="authSideBadge">Acesso seguro</div>
                        <div className="authSideTitle">Recupere sua conta sem perder o ritmo das vendas.</div>
                        <div className="authSideSub">
                            Enviamos um link seguro para o e-mail cadastrado. Depois disso, basta definir uma nova senha e voltar ao painel.
                        </div>
                    </div>
                </div>

                <div className="authMain">
                    <div className="authCard animate-fade-in">
                        <div className="authBrand">
                            <img
                                src={brandLogo}
                                alt="GouPay"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/logo.png';
                                }}
                                className="authBrandLogo"
                            />
                        </div>

                        <div className="authHeader">
                            <h1 className="authTitle">Recuperar senha</h1>
                            <p className="authSubtitle">
                                {sent ? 'Confira seu email para continuar' : 'Informe o email usado na sua conta'}
                            </p>
                        </div>

                        {!sent ? (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: 22 }}>
                                    <label className="authLabel">Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <FiMail style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="seu@email.com"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            style={{ paddingLeft: 44 }}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 28px' }}>
                                    {loading ? 'Enviando...' : <>Enviar link <FiArrowRight size={16} /></>}
                                </button>
                            </form>
                        ) : (
                            <div className="authSuccess">
                                <FiCheckCircle size={34} />
                                <p>
                                    Se uma conta existir com este email, voce recebera as instrucoes de recuperacao em alguns minutos.
                                </p>
                            </div>
                        )}

                        <div className="authFooter">
                            <Link href="/login" className="authLinkBack">
                                <FiArrowLeft size={14} /> Voltar para login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .authShell {
                    min-height: 100vh;
                    background: #fbfaff;
                    color: #0f172a;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: stretch;
                }
                .authBackdrop {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(760px 460px at 8% 10%, rgba(124,58,237,0.14), transparent 62%),
                        radial-gradient(620px 380px at 92% 80%, rgba(139,92,246,0.10), transparent 60%),
                        linear-gradient(180deg, #ffffff 0%, #f8f5ff 100%);
                    pointer-events: none;
                }
                .authLayout {
                    width: 100%;
                    display: grid;
                    grid-template-columns: minmax(420px, 0.95fr) minmax(420px, 1fr);
                    min-height: 100vh;
                    position: relative;
                    z-index: 1;
                }
                .authSide {
                    display: flex;
                    align-items: center;
                    padding: 52px;
                    position: relative;
                }
                .authSide::before {
                    content: '';
                    position: absolute;
                    inset: 32px;
                    border-radius: 30px;
                    background:
                        linear-gradient(135deg, rgba(255,255,255,0.94), rgba(250,247,255,0.86)),
                        radial-gradient(620px 340px at 20% 18%, rgba(124,58,237,0.16), transparent 58%);
                    border: 1px solid rgba(124,58,237,0.12);
                    box-shadow: 0 28px 80px rgba(88,28,135,0.12);
                }
                .authSide::after {
                    content: 'Protegemos o acesso para que somente o titular consiga alterar a senha da conta.';
                    position: absolute;
                    left: 88px;
                    right: 88px;
                    bottom: 88px;
                    padding: 18px 20px;
                    border-radius: 20px;
                    background: rgba(255,255,255,0.82);
                    border: 1px solid rgba(124,58,237,0.12);
                    box-shadow: 0 18px 50px rgba(88,28,135,0.12);
                    color: #475569;
                    font-size: 13px;
                    line-height: 1.55;
                    font-weight: 700;
                    z-index: 2;
                }
                .authSideInner {
                    position: relative;
                    z-index: 2;
                    max-width: 500px;
                    padding: 28px;
                }
                .authSideBadge {
                    display: inline-flex;
                    align-items: center;
                    padding: 8px 14px;
                    border-radius: 999px;
                    background: rgba(124,58,237,0.09);
                    border: 1px solid rgba(124,58,237,0.15);
                    color: #6d28d9;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    margin-bottom: 18px;
                }
                .authSideTitle {
                    color: #0f172a;
                    font-size: 42px;
                    line-height: 1.08;
                    font-weight: 900;
                    letter-spacing: -1px;
                    margin-bottom: 14px;
                }
                .authSideSub {
                    color: #64748b;
                    font-size: 15px;
                    line-height: 1.7;
                    max-width: 460px;
                }
                .authMain {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                }
                .authCard {
                    width: 100%;
                    max-width: 460px;
                    padding: 34px;
                    border-radius: 30px;
                    background: rgba(255,255,255,0.9);
                    border: 1px solid rgba(124,58,237,0.12);
                    box-shadow: 0 30px 90px rgba(88,28,135,0.14);
                }
                .authBrand {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 18px;
                }
                .authBrandLogo {
                    height: 46px;
                    width: auto;
                    object-fit: contain;
                    display: block;
                }
                .authHeader {
                    text-align: center;
                    margin-bottom: 22px;
                }
                .authTitle {
                    font-size: 22px;
                    font-weight: 900;
                    letter-spacing: -0.3px;
                    margin: 0 0 8px;
                    color: #0f172a;
                }
                .authSubtitle,
                .authLabel {
                    color: #64748b;
                    font-size: 13px;
                }
                .authLabel {
                    display: block;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .input-field {
                    background: #ffffff !important;
                    border: 1px solid rgba(124,58,237,0.14) !important;
                    color: #0f172a !important;
                    border-radius: 16px !important;
                    box-shadow: 0 10px 24px rgba(88,28,135,0.05);
                }
                .input-field:focus {
                    border-color: rgba(124,58,237,0.46) !important;
                    box-shadow: 0 0 0 4px rgba(124,58,237,0.10) !important;
                }
                .authSuccess {
                    padding: 22px;
                    border-radius: 20px;
                    background: rgba(124,58,237,0.08);
                    border: 1px solid rgba(124,58,237,0.14);
                    text-align: center;
                    color: #6d28d9;
                }
                .authSuccess p {
                    margin: 10px 0 0;
                    color: #475569;
                    font-size: 14px;
                    line-height: 1.65;
                }
                .authFooter {
                    margin-top: 20px;
                    display: flex;
                    justify-content: center;
                }
                .authLinkBack {
                    color: #6d28d9;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 800;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                }
                @media (max-width: 980px) {
                    .authLayout {
                        grid-template-columns: 1fr;
                    }
                    .authSide {
                        display: none;
                    }
                    .authMain {
                        padding: 36px 18px;
                    }
                    .authCard {
                        padding: 30px;
                    }
                }
                @media (max-width: 420px) {
                    .authCard {
                        padding: 26px 18px;
                    }
                    .authBrandLogo {
                        height: 42px;
                    }
                }
            `}</style>
        </div>
    );
}
