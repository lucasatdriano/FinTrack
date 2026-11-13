# FinTrack — Frontend

Interface web do FinTrack, construída com **Next.js** (App Router) e **TypeScript**.

## Stack

- [Next.js](https://nextjs.org/) (App Router) + React
- TypeScript
- Tailwind CSS
- Consome a API do backend (`NEXT_PUBLIC_API_URL`)

## Estrutura

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/            # login, cadastro, esqueci a senha, verificação de e-mail
│   │   └── (protected)/       # dashboard, transações, contas, orçamento, investimentos, configurações
│   ├── components/
│   │   ├── ui/                # botões, inputs, cards, tooltips...
│   │   ├── modals/            # criar/editar transação, conta, categoria, orçamento, investimento
│   │   └── layout/            # header, sidebar, bottombar...
│   ├── hooks/
│   ├── lib/                   # cliente da API, formatadores, utilitários
│   └── validators/            # validação de formulários
├── public/
├── Dockerfile
└── .env.example
```

As pastas entre parênteses são _route groups_: separam layouts (sem sidebar no login, com sidebar no dashboard) sem alterar a URL.

## Como rodar

```bash
npm install
cp .env.example .env
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). O backend precisa estar rodando em `http://localhost:3001` (veja o README da raiz).

## Variáveis de ambiente

| Variável              | Descrição                                      |
| --------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da API (ex.: `http://localhost:3001`) |

> Variáveis `NEXT_PUBLIC_*` são embutidas no build. Ao mudar o valor, é preciso gerar o build novamente.

## Scripts

| Comando         | O que faz                   |
| --------------- | --------------------------- |
| `npm run dev`   | Servidor de desenvolvimento |
| `npm run build` | Build de produção           |
| `npm run start` | Executa a build de produção |
| `npm run lint`  | Linter                      |

## Design e responsividade

- Protótipo desenvolvido no Figma, com versões para **desktop (1440px)**, **tablet (768px)** e **mobile (390px)**.
- No mobile, a sidebar dá lugar a uma barra de navegação inferior e os modais viram _bottom sheets_.
- Termos financeiros (CDI, Selic, IPCA, CDB, LCI/LCA) têm ícone de informação com explicação, alimentado por um glossário único.
- Telas com estados de vazio, carregamento (skeleton) e erro.

## Docker

O `Dockerfile` gera uma imagem de produção em múltiplos estágios usando o modo `standalone` do Next.js, que exige a opção abaixo no `next.config.ts`:

```ts
const nextConfig = {
    output: 'standalone',
};

export default nextConfig;
```

O `NEXT_PUBLIC_API_URL` é recebido como _build arg_. Em geral, suba tudo pelo `docker compose` da raiz.
