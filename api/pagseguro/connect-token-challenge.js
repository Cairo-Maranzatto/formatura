export default function handler(req, res) {
  return res.status(410).json({
    error: 'Integração PagSeguro descontinuada.',
    message: 'Este endpoint não é mais utilizado após a migração para Mercado Pago.',
  });
}
