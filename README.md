# Landing Page Formatura (React + Mercado Pago)

Este projeto contém a SPA da landing page e a API local para iniciar checkout no Mercado Pago (Checkout Pro).

## Pré-requisitos
- Node.js 20+
- Access token do Mercado Pago (teste ou produção)

## Configuração
1. Instale dependências:
   - `npm install`
2. Crie o arquivo `.env` na raiz de `landing-react` com base em `.env.example`.
3. Preencha no `.env`:
   - `MERCADOPAGO_ACCESS_TOKEN`
   - `MERCADOPAGO_BASE_URL` (`https://api.mercadopago.com`)
   - `MERCADOPAGO_SUCCESS_URL` (ex.: `http://localhost:5173/sucesso`)
   - `MERCADOPAGO_PENDING_URL` (ex.: `http://localhost:5173/sucesso`)
   - `MERCADOPAGO_FAILURE_URL` (ex.: `http://localhost:5173/sucesso`)
   - `MERCADOPAGO_NOTIFICATION_URL` (ex.: `http://localhost:3000/api/webhook/mercadopago`)
   - `MERCADOPAGO_STATEMENT_DESCRIPTOR` (opcional)
   - `MERCADOPAGO_INTEGRATION_TYPE` (`web` ou `mobile`)
   - `MERCADOPAGO_WEBHOOK_TOKEN` (token arbitrário para validar notificações)

## Executar em desenvolvimento
- `npm run dev`

Esse comando sobe:
- Frontend Vite em `http://localhost:5173`
- API Express em `http://localhost:3000`

## Endpoints da API
- `GET /api/health`
- `POST /api/checkout`
- `POST /api/webhook/mercadopago?token=SEU_TOKEN`

No deploy da Vercel, as rotas serverless estão em:
- `api/checkout.js`
- `api/webhook/mercadopago.js`

### Configuração Webhook
1. No painel do Mercado Pago, configure a URL de notificação.
2. Adicione o parâmetro `?token=VALOR` na URL para maior segurança, combinando com o `MERCADOPAGO_WEBHOOK_TOKEN` no seu `.env`.

## Build
- `npm run build`

## Observações
- A API do Mercado Pago é chamada apenas no backend para proteger o token.
- O formulário de RSVP já envia `nome`, `email`, `celular`, `cpf`, `qtdAdulto` e `qtdInfantil`.
