import { MercadoPagoConfig, Preference } from 'mercadopago';

const ADULT_PRICE_CENTS = 92290;
const CHILD_PRICE_CENTS = 46290;

function normalizeIntegrationType(value) {
  return String(value || 'web').toLowerCase() === 'mobile' ? 'mobile' : 'web';
}

function appendWebhookToken(url, token) {
  if (!url || !token) {
    return url;
  }

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}token=${encodeURIComponent(token)}`;
}

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
      id: 'convite_adulto',
      title: 'Convite Adulto - Formatura Medicina',
      quantity: adultQty,
      unit_price: ADULT_PRICE_CENTS / 100,
      currency_id: 'BRL',
    });
  }

  if (childQty > 0) {
    items.push({
      id: 'convite_infantil',
      title: 'Convite Infantil - Formatura Medicina',
      quantity: childQty,
      unit_price: CHILD_PRICE_CENTS / 100,
      currency_id: 'BRL',
    });
  }

  return items;
}

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { nome, email, celular, cpf, qtdAdulto, qtdInfantil } = getJsonBody(req);

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

  const mercadoPagoToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const mercadoPagoBaseUrl = process.env.MERCADOPAGO_BASE_URL || 'https://api.mercadopago.com';
  const successUrl = process.env.MERCADOPAGO_SUCCESS_URL || process.env.MERCADOPAGO_REDIRECT_URL;
  const pendingUrl = process.env.MERCADOPAGO_PENDING_URL || successUrl;
  const failureUrl = process.env.MERCADOPAGO_FAILURE_URL || successUrl;
  const notificationUrl = process.env.MERCADOPAGO_NOTIFICATION_URL;
  const statementDescriptor = process.env.MERCADOPAGO_STATEMENT_DESCRIPTOR;
  const integrationType = normalizeIntegrationType(process.env.MERCADOPAGO_INTEGRATION_TYPE);
  const webhookToken = process.env.MERCADOPAGO_WEBHOOK_TOKEN;

  if (!mercadoPagoToken) {
    return res.status(500).json({ error: 'Access token do Mercado Pago não configurado.' });
  }

  if (!successUrl) {
    return res.status(500).json({ error: 'URL de sucesso do checkout não configurada.' });
  }

  if (!['https://api.mercadopago.com', 'https://api.mercadopago.com/'].includes(mercadoPagoBaseUrl) && !mercadoPagoBaseUrl.includes('mercadopago')) {
    return res.status(500).json({ error: 'MERCADOPAGO_BASE_URL inválida.' });
  }

  const cleanedCpf = String(cpf).replace(/\D/g, '');
  const cleanedPhone = String(celular).replace(/\D/g, '');
  const referenceId = `PEDIDO-${Date.now()}`;

  if (cleanedCpf.length !== 11) {
    return res.status(400).json({ error: 'CPF inválido. Informe 11 dígitos.' });
  }

  if (cleanedPhone.length < 10) {
    return res.status(400).json({ error: 'Celular inválido. Informe DDD + número.' });
  }

  const payload = {
    items: buildItems(adultQty, childQty),
    payer: {
      name: nome,
      email,
      identification: {
        type: 'CPF',
        number: cleanedCpf,
      },
    },
    back_urls: {
      success: successUrl,
      pending: pendingUrl,
      failure: failureUrl,
    },
    auto_return: 'approved',
    external_reference: referenceId,
    metadata: {
      celular: cleanedPhone,
      qtd_adulto: adultQty,
      qtd_infantil: childQty,
    },
    payment_methods: {
      excluded_payment_types: [
        { id: 'ticket' },
        { id: 'atm' },
        { id: 'debit_card' }
      ],
      installments: 12,
    },
  };

  if (notificationUrl) {
    payload.notification_url = appendWebhookToken(notificationUrl, webhookToken);
  }

  if (statementDescriptor) {
    payload.statement_descriptor = statementDescriptor;
  }

  try {
    const client = new MercadoPagoConfig({
      accessToken: mercadoPagoToken,
      options: {
        timeout: 10000,
        baseUrl: mercadoPagoBaseUrl,
      },
    });
    const preference = new Preference(client);
    const data = await preference.create({ body: payload });

    const initPoint = data?.init_point || null;
    const sandboxInitPoint = data?.sandbox_init_point || null;
    const checkoutUrl = integrationType === 'mobile'
      ? (sandboxInitPoint || initPoint)
      : (initPoint || sandboxInitPoint);

    if (!checkoutUrl) {
      return res.status(502).json({
        error: 'Mercado Pago não retornou URL de checkout.',
        details: data,
      });
    }

    return res.status(200).json({
      checkoutUrl,
      referenceId,
      preferenceId: data?.id,
      integrationType,
      initPoint,
      sandboxInitPoint,
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Falha ao criar checkout no Mercado Pago.',
      details: error?.cause || (error instanceof Error ? error.message : 'Erro desconhecido'),
    });
  }
}
