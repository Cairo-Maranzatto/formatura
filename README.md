# Landing Page Formatura (React + PagSeguro)

Este projeto contém a SPA da landing page e a API local para iniciar checkout no PagSeguro.

## Pré-requisitos
- Node.js 20+
- Token de integração PagSeguro (Sandbox ou Produção)

## Configuração
1. Instale dependências:
   - `npm install`
2. Crie o arquivo `.env` na raiz de `landing-react` com base em `.env.example`.
3. Preencha no `.env`:
   - `PAGSEGURO_TOKEN`
   - `PAGSEGURO_BASE_URL` (`https://sandbox.api.pagseguro.com` ou produção)
   - `PAGSEGURO_REDIRECT_URL` (ex.: `http://localhost:5173/sucesso`)
   - `PAGSEGURO_CONNECT_TOKEN_CHALLENGE` (opcional, para resposta fixa do endpoint de challenge)

## Executar em desenvolvimento
- `npm run dev`

Esse comando sobe:
- Frontend Vite em `http://localhost:5173`
- API Express em `http://localhost:3000`

## Endpoints da API
- `GET /api/health`
- `POST /api/checkout`
- `POST /api/webhook/pagseguro`
- `GET /api/pagseguro/connect-token-challenge`
- `POST /api/pagseguro/connect-token-challenge`

No deploy da Vercel, as rotas serverless estão em:
- `api/checkout.js`
- `api/webhook/pagseguro.js`
- `api/pagseguro/connect-token-challenge.js`

## URL para cadastrar no PagSeguro
Para a tela de **Cadastrar URL** do Connect Token Challenge, use:

- `https://formatura-seven.vercel.app/api/pagseguro/connect-token-challenge`

## Build
- `npm run build`

## Observações
- A API PagSeguro é chamada apenas no backend para proteger o token.
- O formulário de RSVP já envia `nome`, `email`, `celular`, `cpf`, `qtdAdulto` e `qtdInfantil`.
