import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: { rejectUnauthorized: false },
});

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
        console.log(`[EMAIL] SMTP não configurado. Pulando envio para ${buyerEmail}`);
        return;
    }

    const methodLabel = paymentMethod === 'credit_card' ? 'Cartão de Crédito' : 'PIX';
    const memberAreaUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://goupay.com.br'}/area-membros`;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

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
