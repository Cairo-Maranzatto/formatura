import { MercadoPagoConfig, Payment } from 'mercadopago';

function getJsonBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  // 1. Validar método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Validar Token de Segurança (opcional via query string)
  const webhookToken = process.env.MERCADOPAGO_WEBHOOK_TOKEN;
  const token = req.query?.token;

  if (webhookToken && token !== webhookToken) {
    console.warn('Webhook recebido com token inválido.');
    return res.status(401).json({ error: 'Token de webhook inválido.' });
  }

  // 3. Responder IMEDIATAMENTE com 200 OK para o Mercado Pago não reenviar
  // Em ambientes serverless como Vercel, precisamos processar antes de fechar a conexão,
  // mas o Mercado Pago espera o status 200 rápido.
  
  const payload = getJsonBody(req);
  console.log('Webhook Mercado Pago recebido:', JSON.stringify(payload));

  const { type, action, data } = payload;

  // 4. Processar apenas eventos de pagamento
  if (type === 'payment' || payload.topic === 'payment') {
    const paymentId = data?.id || payload.id || payload['data.id'];
    
    if (paymentId) {
      try {
        const client = new MercadoPagoConfig({
          accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        });
        
        const payment = new Payment(client);
        const paymentDetails = await payment.get({ id: paymentId });
        
        console.log(`Status do Pagamento ${paymentId}:`, paymentDetails.status);
        console.log('Detalhes:', JSON.stringify(paymentDetails));
        
        // AQUI: Você pode adicionar lógica para salvar no banco de dados
        // ex: if (paymentDetails.status === 'approved') { confirmarPresenca(paymentDetails.external_reference); }

      } catch (error) {
        console.error(`Erro ao buscar detalhes do pagamento ${paymentId}:`, error);
        // Mesmo com erro, retornamos 200 para evitar loops de reenvio se o erro for de lógica interna
      }
    }
  }

  return res.status(200).json({ received: true });
}
