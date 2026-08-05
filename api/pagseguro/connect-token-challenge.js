function resolveChallenge(input) {
  const value =
    input?.challenge ||
    input?.token ||
    input?.code ||
    process.env.PAGSEGURO_CONNECT_TOKEN_CHALLENGE;

  return value ? String(value) : null;
}

export default function handler(req, res) {
  const source = req.method === 'POST' ? req.body : req.query;
  const challenge = resolveChallenge(source);

  if (!challenge) {
    return res.status(400).json({
      error:
        'Informe challenge/token/code ou configure PAGSEGURO_CONNECT_TOKEN_CHALLENGE nas variáveis da Vercel.',
    });
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.status(200).send(challenge);
}
