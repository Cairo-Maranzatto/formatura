import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);

const ADULT_PRICE_CENTS = 92290;
const CHILD_PRICE_CENTS = 46290;

app.use(cors());
app.use(express.json());

function toPositiveInteger(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function buildItems(adultQty, childQty) {
  const items = [];

  if (adultQty > 0) {
    items.push({
      reference_id: 'convite_adulto',
      name: 'Convite Adulto - Formatura Medicina',
      quantity: adultQty,
      unit_amount: ADULT_PRICE_CENTS,
    });
  }

  if (childQty > 0) {
    items.push({
      reference_id: 'convite_infantil',
      name: 'Convite Infantil - Formatura Medicina',
      quantity: childQty,
      unit_amount: CHILD_PRICE_CENTS,
    });
  }

  return items;
}

function resolveChallengePayload(input) {
  const challengeValue = input?.challenge || input?.token || input?.code || process.env.PAGSEGURO_CONNECT_TOKEN_CHALLENGE;

  if (!challengeValue) {
    return null;
  }

  return String(challengeValue);
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/pagseguro/connect-token-challenge', (req, res) => {
  const challenge = resolveChallengePayload(req.query);

  if (!challenge) {
    return res.status(400).json({
      error: 'Informe challenge/token/code na query ou configure PAGSEGURO_CONNECT_TOKEN_CHALLENGE no .env.',
    });
  }

  return res.status(200).type('text/plain').send(challenge);
});

app.post('/api/pagseguro/connect-token-challenge', (req, res) => {
  const challenge = resolveChallengePayload(req.body);

  if (!challenge) {
    return res.status(400).json({
      error: 'Informe challenge/token/code no body ou configure PAGSEGURO_CONNECT_TOKEN_CHALLENGE no .env.',
    });
  }

  return res.status(200).type('text/plain').send(challenge);
});

app.post('/api/checkout', async (req, res) => {
  const {
    nome,
    email,
    celular,
    cpf,
    qtdAdulto,
    qtdInfantil,
  } = req.body;

  const adultQty = toPositiveInteger(qtdAdulto);
  const childQty = toPositiveInteger(qtdInfantil);

  if (!nome || !email || !celular || !cpf) {
    return res.status(400).json({ error: 'Preencha nome, email, celular e CPF.' });
  }

  if (adultQty === null || childQty === null) {
    return res.status(400).json({ error: 'Quantidade de convites inválida.' });
  }

  if (adultQty + childQty <= 0) {
    return res.status(400).json({ error: 'Selecione ao menos um convite.' });
  }

  const pagSeguroToken = process.env.PAGSEGURO_TOKEN;
  const pagSeguroBaseUrl = process.env.PAGSEGURO_BASE_URL || 'https://sandbox.api.pagseguro.com';
  const redirectUrl = process.env.PAGSEGURO_REDIRECT_URL;

  if (!pagSeguroToken) {
    return res.status(500).json({ error: 'Token do PagSeguro não configurado no backend.' });
  }

  if (!redirectUrl) {
    return res.status(500).json({ error: 'URL de redirecionamento não configurada.' });
  }

  const cleanedCpf = String(cpf).replace(/\D/g, '');
  const items = buildItems(adultQty, childQty);
  const referenceId = `PEDIDO-${Date.now()}`;

  const payload = {
    reference_id: referenceId,
    customer: {
      name: nome,
      email,
      tax_id: cleanedCpf,
      phones: [
        {
          country: '55',
          area: String(celular).replace(/\D/g, '').slice(0, 2) || '19',
          number: String(celular).replace(/\D/g, '').slice(2) || '000000000',
          type: 'MOBILE',
        },
      ],
    },
    items,
    redirect_url: redirectUrl,
  };

  try {
    const response = await axios.post(`${pagSeguroBaseUrl}/checkouts`, payload, {
      headers: {
        Authorization: `Bearer ${pagSeguroToken}`,
        'Content-Type': 'application/json',
      },
    });

    const links = response.data?.links || [];
    const checkoutLink = links.find((link) => String(link.rel).toUpperCase() === 'PAY');

    if (!checkoutLink?.href) {
      return res.status(502).json({ error: 'PagSeguro não retornou URL de checkout.' });
    }

    return res.json({
      checkoutUrl: checkoutLink.href,
      referenceId,
    });
  } catch (error) {
    const apiError = error.response?.data || error.message;
    return res.status(502).json({
      error: 'Falha ao criar checkout no PagSeguro.',
      details: apiError,
    });
  }
});

app.post('/api/webhook/pagseguro', (req, res) => {
  const payload = req.body;

  console.log('Webhook PagSeguro recebido:', JSON.stringify(payload));

  return res.status(200).send('Recebido');
});

app.listen(port, () => {
  console.log(`Servidor de pagamentos rodando na porta ${port}`);
});
