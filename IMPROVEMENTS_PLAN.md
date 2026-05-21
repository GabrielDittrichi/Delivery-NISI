# Espaco Vida Saudavel NISI - Plano de Melhorias (Multi-Steps + Checklist)

Repo local: `/Users/dittrichi/Desktop/Clientes RDS/Espaco NISI/delivery-nisi`

Objetivo: transformar o cardapio em uma experiencia digital do **Espaco Vida Saudavel NISI**, um restaurante/EVS saudavel com preparos Herbalife, reforcando bem-estar, rotina, energia e comunidade. O produto deve aumentar conversao, reduzir friccao no checkout, melhorar performance, confiabilidade, seguranca e qualidade do codigo.

Plano de design detalhado: `DESIGN_PLAN_NISI.md`

## Pesquisa e Direcao de Marca

Referencias consultadas:

- Herbalife Brasil: distribuidores/coaches atuam como parceiros de bem-estar, oferecendo orientacao, motivacao e apoio continuo para objetivos individuais.
- Materiais de EVS da Herbalife: o Espaco Vida Saudavel e apresentado como ambiente de convivencia/comunidade, nao apenas food service; o foco inclui shakes, bebidas a base de cha, proteina, fibra, energia e experiencia personalizada.
- Cardapios oficiais de receitas/drinks EVS: comunicacao usa categorias como shakes, bebidas funcionais, lanches doces, fonte de fibras, proteico e rendimento por porcao.

Direcao visual:

- Tema base: **branco + verde Herbalife/vida saudavel**, com muito espaco em branco, contraste limpo e detalhes em verde.
- Evitar cara de fast-food/delivery generico.
- Visual desejado: leve, fresco, energizante, confiavel, com linguagem de rotina saudavel.
- Usar fotografia/imagens reais de shakes, bebidas, copos, ingredientes verdes/frutas e ambiente limpo quando houver ativos.
- Microcopy deve falar de “bem-estar”, “energia”, “rotina”, “proteina”, “fibra”, “leveza”, “saciedade” e “objetivos”.
- Evitar promessas medicas ou absolutas como “emagrece”, “cura”, “resultado garantido”. Usar linguagem responsavel: “apoia sua rotina”, “opcoes para seus objetivos”, “mais proteina no dia”.

Categorias sugeridas para o cardapio:

- Combos do Dia
- Shakes Nutritivos
- Bebidas Funcionais
- Chas e Energia
- Proteicos
- Lanches Saudaveis
- Adicionais

Copy base:

- Nome principal: `Espaco Vida Saudavel NISI`
- Subtitulo: `Shakes, bebidas funcionais e opcoes proteicas para uma rotina mais leve.`
- CTA principal: `Montar meu pedido`
- CTA secundario: `Ver combos`
- Sinal de confianca: `Atendimento personalizado para seus objetivos de bem-estar`

## 0) Baseline (antes de mexer muito)

- [x] Criar `.env.example` com todas variaveis usadas (DB, R2, WhatsApp, Admin Auth).
- [x] Documentar setup (README) com “rodar local”, “rodar seed”, “rodar migrations”.
- [x] Criar um conjunto minimo de dados no seed (restaurante + categorias + produtos + addons/flavors).
- [x] Definir KPI simples:
  - [x] taxa de “add to cart”
  - [x] taxa de “checkout opened”
  - [x] taxa de “order created”
  - [x] origem de trafego (Instagram/Google/Direto)

## 1) Critico: seguranca e “funcionar de ponta a ponta”

### 1.1 Proteger `/admin`
- [x] Colocar auth (minimo viavel): `proxy.ts` com Basic Auth via `ADMIN_USER`/`ADMIN_PASS`.
- [ ] Opcional: permitir IP allowlist (se for intranet/loja).
- [ ] Registrar acesso ao admin (visit log separado) para auditoria. Opcional para fase 2.

### 1.2 Checkout/WhatsApp correto
- [ ] WhatsApp nao pode ser fixo: ler de `NEXT_PUBLIC_WHATSAPP_NUMBER` (pendente: definir numero real depois).
- [x] Mensagem WhatsApp deve mostrar nomes de sabores/addons (nao IDs).
- [x] Total do pedido no DB deve bater com o carrinho (incluindo adicionais).
- [x] Persistir `deliveryMethod` no DB (DELIVERY/PICKUP) e refletir no painel.

### 1.3 Validacao e UX “anti-erro”
- [x] Mascara de telefone e CEP.
- [x] Validacao final de telefone/CEP antes do submit.
- [x] Se CEP invalido, bloquear submit e explicar o problema.
- [x] Se entrega for “PICKUP”, nao exigir endereco (nem enviar campos vazios como “obrigatorios”).

## 2) Design/UX (mais bonito, animado e com cara de produto)

### 2.1 Tema e consistencia visual
- [x] Unificar “brand color” com CSS vars.
- [x] Criar ThemeProvider (CSS vars) usando `Restaurant.primaryColor`.
- [x] Fixar preset recomendado para NISI: branco + verde saudavel.
- [x] Padronizar radius, sombras, espaco e tipografia (component tokens).
- [x] Atualizar identidade textual para `Espaco Vida Saudavel NISI`.

### 2.2 Home (cardapio)
- [x] Header com sinais de confianca: tempo medio, taxa, pedido minimo, avaliacao.
- [x] Header com posicionamento EVS: bem-estar, rotina saudavel, Herbalife e atendimento personalizado.
- [ ] Cards de produto:
  - [x] melhorar hierarquia (nome, descricao curta, preco destacado)
  - [x] estados de hover/touch e skeleton/placeholder
  - [x] imagem otimizada (next/image)
  - [x] badges por objetivo: Proteico, Energia, Leve, Fibra, Combo
- [ ] Navegacao por categoria:
  - [x] destacar categoria ativa com underline animado + bom contraste
  - [x] reduzir “jitter” do IntersectionObserver (threshold/rootMargin calibrados)

### 2.3 Produto (detalhes)
- [x] Melhorar lightbox (esc + clique fora + scroll lock).
- [x] “Adicionar” com feedback (micro-animacao, estado disabled claro).
- [x] Mostrar adicionais com preco e recalculo instantaneo (ja existe, polir).
- [x] Melhorar acessibilidade: labels, focus states, aria.

### 2.4 Carrinho (sidebar)
- [x] Botao “Finalizar” mais chamativo e consistente com a marca.
- [x] Mostrar “frete a combinar” de forma mais elegante (sem emoji no texto final do app).
- [x] Permitir editar item rapidamente (quantidade, remover) sem pular layout.

### 2.5 Checkout
- [x] Layout em “passos” (Dados -> Entrega/Retirada -> Pagamento -> Confirmacao).
- [x] Resumo fixo do pedido (itens + adicionais + desconto).
- [x] Cupom mais claro (feedback bom/ruim, botao aplicar com loading).
- [x] Ajustar linguagem do checkout para `pedido no Espaco Vida Saudavel NISI`.

## 3) Performance (LCP/TTFB/bundle)

- [x] Trocar `<img>` por `next/image` nas imagens criticas.
- [x] Configurar `next.config.ts` `images.remotePatterns` (R2/CDN).
- [x] Remover `force-dynamic` onde nao precisa e usar cache/revalidate.
- [ ] Evitar buscar `getData()` duplicado (baixo impacto; manter para buscar cor do restaurante).
- [x] Evitar analytics “pesado” no cliente (ver 4).

## 4) Analytics e observabilidade (sem atrito)

- [x] Substituir `ipapi.co` no cliente por tracking server-side (rota `/api/track`).
- [ ] Persistir eventos:
  - [x] visit
  - [x] product_view
  - [x] add_to_cart (novo)
  - [x] checkout_started (novo)
  - [x] order_created (ja existe, polir)
- [x] Criar painel simples de funil no admin (conversao por etapa).

## 5) Qualidade de codigo (lint/types/tests)

- [x] Zerar erros de lint (banir `any` onde e facil tipar).
- [x] Ajustar `CartContext` (evitar `setState` dentro do effect de load, usando initializer lazy).
- [x] Padronizar tipos compartilhados (DTOs) para client/server.
- [x] Adicionar ao menos testes leves:
  - [x] `slugify`
  - [x] calculo de total com addons
  - [x] validacao de cupom

## 6) Operacao (deploy, DB, rotinas)

- [x] Migrations Prisma (em vez de “schema solto”).
- [x] Seed idempotente (nao duplicar registros).
- [x] Healthcheck simples (rota `/api/health`).
- [ ] Scripts:
  - [x] `npm run typecheck`
  - [x] `npm run lint`
  - [x] `npm run prisma:migrate`

## Roadmap sugerido (ordem)

1. Seguranca + Totais corretos
2. Reposicionamento Espaco Vida Saudavel NISI + tema branco/verde
3. Performance (next/image + cache/revalidate)
4. Analytics server-side + funil
5. Lint/types + testes
6. Deploy/ops
