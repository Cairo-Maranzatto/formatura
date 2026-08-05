const ADULT_PRICE_CENTS = 92290;
const CHILD_PRICE_CENTS = 46290;

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

  const pagSeguroToken = process.env.PAGSEGURO_TOKEN;
  const pagSeguroBaseUrl = process.env.PAGSEGURO_BASE_URL || 'https://sandbox.api.pagseguro.com';
  const redirectUrl = process.env.PAGSEGURO_REDIRECT_URL;

  if (!pagSeguroToken) {
    return res.status(500).json({ error: 'Token do PagSeguro não configurado.' });
  }

  if (!redirectUrl) {
    return res.status(500).json({ error: 'URL de redirecionamento não configurada.' });
  }

  const cleanedCpf = String(cpf).replace(/\D/g, '');
  const cleanedPhone = String(celular).replace(/\D/g, '');
  const area = cleanedPhone.slice(0, 2);
  const number = cleanedPhone.slice(2);

  const payload = {
    reference_id: `PEDIDO-${Date.now()}`,
    customer: {
      name: nome,
      email,
      tax_id: cleanedCpf,
      phones: [
        {
          country: '55',
          area: area || '11',
          number: number || '999999999',
          type: 'MOBILE',
        },
      ],
    },
    items: buildItems(adultQty, childQty),
    redirect_url: redirectUrl,
  };

  try {
    const response = await fetch(`${pagSeguroBaseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pagSeguroToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: 'Falha ao criar checkout no PagSeguro.',
        details: data,
      });
    }

    const links = data?.links || [];
    const checkoutLink = links.find((link) => String(link.rel).toUpperCase() === 'PAY');

    if (!checkoutLink?.href) {
      return res.status(502).json({ error: 'PagSeguro não retornou URL de checkout.' });
    }

    return res.status(200).json({
      checkoutUrl: checkoutLink.href,
      referenceId: payload.reference_id,
    });
  } catch (error) {
    return res.status(502).json({
      error: 'Erro de comunicação com o PagSeguro.',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
