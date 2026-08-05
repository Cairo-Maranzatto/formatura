export default async function handler(req, res) {
  return res.status(410).json({
    error: 'Integração PagSeguro descontinuada.',
    message: 'Utilize /api/webhook/mercadopago para notificações de pagamento.',
  });
}
