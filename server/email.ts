interface PasswordResetEmail {
  to: string;
  name: string;
  code: string;
  expiresInMinutes: number;
}

export function isEmailDeliveryConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendPasswordResetEmail({
  to,
  name,
  code,
  expiresInMinutes,
}: PasswordResetEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error('Serviço de e-mail não configurado.');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `${code} é seu código de recuperação do Speek It`,
      text: `Olá, ${name}. Seu código de recuperação do Speek It é ${code}. Ele expira em ${expiresInMinutes} minutos. Se você não solicitou a troca de senha, ignore esta mensagem.`,
      html: `
        <div style="background:#030608;padding:32px;font-family:Arial,sans-serif;color:#e9fbfd">
          <div style="max-width:520px;margin:0 auto;background:#061015;border:1px solid #17363d;border-radius:20px;padding:32px">
            <p style="margin:0;color:#00E7FF;font-size:13px;letter-spacing:3px;text-transform:uppercase">Speek It.</p>
            <h1 style="margin:20px 0 8px;font-size:24px">Recuperação de senha</h1>
            <p style="margin:0;color:#9bb0b5;line-height:1.6">Olá, ${escapeHtml(name)}. Use o código abaixo para criar uma nova senha:</p>
            <div style="margin:28px 0;padding:20px;text-align:center;background:#030608;border-radius:14px;color:#00E7FF;font-size:34px;font-weight:700;letter-spacing:10px">${code}</div>
            <p style="margin:0;color:#71868b;font-size:13px;line-height:1.6">O código expira em ${expiresInMinutes} minutos. Se você não solicitou esta alteração, ignore o e-mail.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha no envio de e-mail (${response.status}): ${detail.slice(0, 300)}`);
  }
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  })[character] ?? character);
}
