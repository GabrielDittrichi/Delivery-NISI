# Espaco Vida Saudavel NISI

Cardapio digital e painel administrativo para o Espaco Vida Saudavel NISI.

## Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma + PostgreSQL
- Cloudflare R2/S3 para upload de imagens

## Setup local

1. Instale dependencias:

```bash
npm ci
```

2. Crie `.env.local` baseado no `.env.example`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rds?sslmode=require&schema=espaconisi
NEXT_PUBLIC_WHATSAPP_NUMBER=5599999999999
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_META_PIXEL_ID=
ADMIN_USERS=admin
ADMIN_PASS=use-uma-senha-forte-aqui
```

3. Rode migrations e seed:

```bash
npm run prisma:migrate
npm run prisma:seed
```

4. Suba o projeto:

```bash
npm run dev
```

## Admin

O admin fica em `/admin` e usa Basic Auth. Em producao, configure uma senha forte e exclusiva em `ADMIN_PASS`.

Usuarios configurados por `ADMIN_USERS`, separados por virgula. Evite senhas padrao ou compartilhadas.

## Scripts

```bash
npm run lint
npm run typecheck
npm run test:smoke
npm run build
npm run prisma:migrate
npm run prisma:seed
```

## Operacao

- Healthcheck: `/api/health`
- Eventos de funil: `add_to_cart`, `checkout_started`, `order_created`
- Visitas: `/api/track`
- Cardapio presencial sem pedidos: `/cardapio`
- Cupons: `NISI10` vem no seed inicial

## Banco próprio RDS

Use o PostgreSQL próprio da RDS preenchendo `DATABASE_URL` com a connection string do projeto. Para o Espaço NISI, a aplicação deve usar o schema `espaconisi`:

```env
DATABASE_URL=postgresql://user:password@host:5432/rds?sslmode=require&schema=espaconisi
```

Depois rode:

```bash
npm run prisma:migrate
npm run prisma:seed
```

As tabelas principais ficam cobertas por Prisma: restaurante, categorias, produtos, sabores, adicionais, cupons, pedidos, itens do pedido, visitas e eventos de funil. A aba `Clientes` agrega os dados dos pedidos pelo telefone do checkout.

## Google e Meta

Configure quando tiver os IDs:

- `NEXT_PUBLIC_GTM_ID`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_META_PIXEL_ID`

Eventos enviados: `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase` e `ApplyCoupon`.

## Observacoes

Sem `DATABASE_URL`, o app usa os produtos reais do PDF como fallback local. Com banco configurado, usa os dados cadastrados no admin/PostgreSQL.
