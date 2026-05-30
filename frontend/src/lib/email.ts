import nodemailer from 'nodemailer';

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
}

export async function sendPurchaseApprovedEmail({
    buyerName,
    buyerEmail,
    productName,
    amount,
    paymentMethod,
    orderId,
}: {
    buyerName: string;
    buyerEmail: string;
    productName: string;
    amount: string;
    paymentMethod: string;
    orderId: string;
}) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[EMAIL] SMTP não configurado. SMTP_USER=${process.env.SMTP_USER ? 'ok' : 'MISSING'} SMTP_PASS=${process.env.SMTP_PASS ? 'ok' : 'MISSING'}`);
        return;
    }

    const methodLabel = paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX';
    const memberAreaUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://goupay.com.br'}/area-membros`;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const transporter = createTransporter();

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Compra Aprovada</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">✅</div>
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">Pagamento Confirmado!</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Seu acesso já está disponível</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;color:#1a1a2e;font-size:16px;line-height:1.6;">
              Olá, <strong>${buyerName || 'cliente'}</strong>! 👋
            </p>
            <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">
              Sua compra foi aprovada com sucesso. Confira os detalhes abaixo:
            </p>
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
                  <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Método</div>
                  <div style="font-size:15px;font-weight:600;color:#1a1a2e;">${methodLabel}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:20px 24px;">
                  <div style="font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Pedido</div>
                  <div style="font-size:13px;font-weight:600;color:#888;font-family:monospace;">${orderId}</div>
                </td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <a href="${memberAreaUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;">
                  Acessar Meu Conteúdo →
                </a>
              </td></tr>
            </table>
            <p style="margin:0;color:#888;font-size:13px;line-height:1.6;text-align:center;">
              Dúvidas? <a href="mailto:support@goupay.com.br" style="color:#6c5ce7;text-decoration:none;">support@goupay.com.br</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background:#f8f9fa;border-top:1px solid #e9ecef;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:12px;">© 2026 GouPay · Email automático, não responda.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: `"GouPay" <${from}>`,
        to: buyerEmail,
        subject: `✅ Compra aprovada — ${productName}`,
        html,
        text: `Pagamento Confirmado!\n\nOlá ${buyerName},\n\nSua compra foi aprovada!\nProduto: ${productName}\nValor: R$ ${amount}\nMétodo: ${methodLabel}\nPedido: ${orderId}\n\nAcesse: ${memberAreaUrl}\n\nDúvidas? support@goupay.com.br`,
    });

    console.log(`[EMAIL] Enviado para ${buyerEmail}`);
}

export async function sendPasswordResetEmail({
    toEmail,
    userName,
    resetToken,
}: {
    toEmail: string;
    userName: string;
    resetToken: string;
}) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log(`[EMAIL] SMTP não configurado para reset de senha`);
        return;
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://goupay.com.br'}/reset-password?token=${resetToken}`;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const transporter = createTransporter();

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Recuperação de Senha</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#6c5ce7 0%,#a29bfe 100%);padding:40px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">🔐</div>
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;">Recuperação de Senha</h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Redefina sua senha com segurança</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 20px;color:#1a1a2e;font-size:16px;line-height:1.6;">
              Olá, <strong>${userName || 'usuário'}</strong>! 👋
            </p>
            <p style="margin:0 0 28px;color:#555;font-size:15px;line-height:1.6;">
              Recebemos uma solicitação para redefinir a senha da sua conta GouPay. Clique no botão abaixo para criar uma nova senha:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr><td align="center">
                <a href="${resetUrl}" style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#6c5ce7,#a29bfe);color:#fff;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;">
                  Redefinir Minha Senha →
                </a>
              </td></tr>
            </table>
            <div style="padding:16px 20px;background:#fff8e1;border-left:4px solid #ffc107;border-radius:8px;margin-bottom:20px;">
              <p style="margin:0;color:#856404;font-size:13px;line-height:1.6;">
                ⚠️ <strong>Este link expira em 1 hora.</strong> Se você não solicitou a redefinição, ignore este email — sua senha permanecerá inalterada.
              </p>
            </div>
            <p style="margin:0;color:#888;font-size:12px;line-height:1.6;">
              Ou copie e cole este link no navegador:<br/>
              <span style="color:#6c5ce7;word-break:break-all;">${resetUrl}</span>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;background:#f8f9fa;border-top:1px solid #e9ecef;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:12px;">© 2026 GouPay · Email automático, não responda.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
        from: `"GouPay" <${from}>`,
        to: toEmail,
        subject: '🔐 Recuperação de Senha — GouPay',
        html,
        text: `Recuperação de Senha\n\nOlá ${userName},\n\nClique no link para redefinir sua senha:\n${resetUrl}\n\nEste link expira em 1 hora.\n\nSe não solicitou, ignore este email.`,
    });

    console.log(`[EMAIL] Email de recuperação enviado para ${toEmail}`);
}
