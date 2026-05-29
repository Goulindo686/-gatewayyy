const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
            port: parseInt(process.env.SMTP_PORT || '465'),
            secure: process.env.SMTP_SECURE !== 'false', // true para 465, false para 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
    }

    async sendMail({ to, subject, html, text }) {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log(`[EMAIL] SMTP não configurado. Email para ${to}: ${subject}`);
            return { success: true, simulated: true };
        }
        try {
            const info = await this.transporter.sendMail({
                from: `"GouPay" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to,
                subject,
                html,
                text
            });
            console.log(`[EMAIL] Enviado para ${to}: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (err) {
            console.error(`[EMAIL] Erro ao enviar para ${to}:`, err.message);
            throw err;
        }
    }

    // ─── Email de compra aprovada ────────────────────────────────────────────

    async sendPurchaseApproved({ buyerName, buyerEmail, productName, amount, paymentMethod, orderId }) {
        const methodLabel = paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX';
        const memberAreaUrl = `${process.env.FRONTEND_URL || 'https://goupay.com.br'}/area-membros`;

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Compra Aprovada</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%);padding:40px 40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Pagamento Confirmado!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Seu acesso já está disponível</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;color:#1a1a2e;font-size:16px;line-height:1.6;">
              Olá, <strong>${buyerName || 'cliente'}</strong>! 👋
            </p>
            <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">
              Sua compra foi aprovada com sucesso. Confira os detalhes abaixo:
            </p>

            <!-- Detalhes do pedido -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:12px;overflow:hidden;margin-bottom:28px;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e9ecef;">
                  <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Produto</div>
                  <div style="font-size:16px;font-weight:700;color:#1a1a2e;">${productName}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e9ecef;">
                  <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Valor pago</div>
                  <div style="font-size:22px;font-weight:800;color:#6c5ce7;">R$ ${amount}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e9ecef;">
                  <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Método de pagamento</div>
                  <div style="font-size:15px;font-weight:600;color:#1a1a2e;">${methodLabel}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;">
                  <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Número do pedido</div>
                  <div style="font-size:13px;font-weight:600;color:#888;font-family:monospace;">${orderId}</div>
                </td>
              </tr>
            </table>

            <!-- Botão CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="${memberAreaUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#ffffff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;letter-spacing:-0.2px;">
                    Acessar Meu Conteúdo →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;color:#888;font-size:13px;line-height:1.6;text-align:center;">
              Se tiver alguma dúvida, entre em contato pelo email<br/>
              <a href="mailto:support@goupay.com.br" style="color:#6c5ce7;text-decoration:none;">support@goupay.com.br</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;background:#f8f9fa;border-top:1px solid #e9ecef;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:12px;">
              © 2026 GouPay · Este é um email automático, não responda diretamente.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const text = `Pagamento Confirmado!\n\nOlá ${buyerName},\n\nSua compra foi aprovada!\n\nProduto: ${productName}\nValor: R$ ${amount}\nMétodo: ${methodLabel}\nPedido: ${orderId}\n\nAcesse sua área de membros: ${memberAreaUrl}\n\nDúvidas? support@goupay.com.br`;

        return this.sendMail({
            to: buyerEmail,
            subject: `✅ Compra aprovada — ${productName}`,
            html,
            text
        });
    }

    // ─── Email de recuperação de senha ───────────────────────────────────────

    async sendPasswordResetEmail(email, resetToken, userName) {
        const resetUrl = `${process.env.FRONTEND_URL || 'https://goupay.com.br'}/reset-password?token=${resetToken}`;

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"/><title>Recuperação de Senha</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6c5ce7,#a29bfe);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔐</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">Recuperação de Senha</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="color:#1a1a2e;font-size:16px;">Olá, <strong>${userName || 'usuário'}</strong>!</p>
            <p style="color:#555;font-size:15px;line-height:1.6;">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
              <tr><td align="center">
                <a href="${resetUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;">
                  Redefinir Minha Senha
                </a>
              </td></tr>
            </table>
            <p style="color:#888;font-size:13px;">⚠️ Este link expira em 1 hora. Se não solicitou, ignore este email.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;background:#f8f9fa;border-top:1px solid #e9ecef;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:12px;">© 2026 GouPay · Email automático.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        return this.sendMail({
            to: email,
            subject: '🔐 Recuperação de Senha — GouPay',
            html,
            text: `Recuperação de Senha\n\nOlá ${userName},\n\nClique no link para redefinir sua senha:\n${resetUrl}\n\nEste link expira em 1 hora.`
        });
    }

    async sendWelcomeEmail(email, userName) {
        console.log(`[EMAIL] Welcome email para: ${email} (${userName})`);
    }

    async sendVerificationEmail(email, verificationToken, userName) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'https://goupay.com.br'}/verify-email?token=${verificationToken}`;
        console.log(`[EMAIL] Verificação para: ${email} — ${verificationUrl}`);
        return { success: true, verificationUrl };
    }
}

module.exports = new EmailService();
