# Plano de Implementacao - Espaco Vida Saudavel NISI

Objetivo: ajustar o projeto para operar com produtos reais do Espaco Vida Saudavel NISI, admin mais completo, cardapio presencial separado, PostgreSQL proprio da RDS e tagueamento Google/Meta.

## 1. Identidade Visual

- [x] Remover detalhes vermelhos restantes no app.
- [x] Padronizar botoes, estados ativos, bordas, icones e alertas principais em tons de verde.
- [x] Manter vermelho apenas para acoes destrutivas reais, como excluir ou cancelar pedido.
- [x] Usar tokens visuais:
  - Verde principal: `#16803C`
  - Verde escuro: `#0F5130`
  - Verde claro: `#EAF7EF`
  - Fundo: `#F8FBF8`
  - Bordas: verde com baixa opacidade

## 2. Produtos Reais

- [x] Remover todos os produtos ficticios gerados anteriormente.
- [x] Manter apenas os produtos reais vindos do PDF:
  - [x] Torta de Frango
  - [x] Empada Grande
  - [x] Empada Pequena
  - [x] Omelete
  - [x] Pao de Queijo
  - [x] Sanduiche de Frango
  - [x] Sanduiche de Atum
  - [x] Fibra Prebiotica
  - [x] Shot Matinal
  - [x] Energy
  - [x] Acelera
  - [x] Pudim
  - [x] Shake de Garrafa
  - [x] Bolo de Pote
  - [x] Shake sem Borda
  - [x] Shake com Borda
- [x] Reorganizar categorias reais:
  - [x] Salgados
  - [x] Bebidas Funcionais
  - [x] Sobremesas
  - [x] Shakes

## 3. Clientes no Admin

- [x] Criar aba `Clientes` no painel administrativo.
- [x] Usar dados coletados no checkout:
  - Nome
  - Telefone
  - CEP
  - Endereco
  - Bairro
  - Cidade
  - Tipo: entrega/retirada
  - Total de pedidos
  - Ultimo pedido
  - Valor total comprado
- [x] Criar visao simples de historico por cliente.
- [x] Evitar duplicidade usando telefone como identificador principal.

## 4. Cupons no Admin

- [x] Corrigir funcionamento completo da aba de cupons.
- [x] Verificar:
  - [x] Listagem
  - [x] Criacao
  - [x] Ativar/desativar
  - [x] Excluir
  - [x] Validacao no checkout
- [x] Melhorias sugeridas:
  - [x] Campo de validade do cupom
  - [x] Limite de usos
  - [x] Valor minimo para aplicar
  - [x] Cupom percentual ou fixo
  - [x] Badge ativo/inativo em verde/cinza

## 5. Melhorias no Admin

- [x] Criar/organizar abas principais:
  - [x] Visao Geral
  - [x] Pedidos
  - [x] Clientes
  - [x] Produtos
  - [x] Categorias
  - [x] Cupons
  - [x] Configuracoes
- [x] Melhorar dashboard:
  - [x] Pedidos do dia
  - [x] Receita do dia
  - [x] Produtos mais vendidos
  - [x] Clientes recorrentes
  - [x] Origem dos acessos
  - [x] Funil: visualizacao -> carrinho -> checkout -> pedido
- [x] Melhorar pedidos:
  - [x] Filtro por status
  - [x] Busca por cliente/telefone
  - [x] Marcar como confirmado/entregue/cancelado
  - [x] Visualizar endereco e pagamento
- [x] Melhorar produtos:
  - [x] Preview visual melhor
  - [x] Campo para categoria
  - [x] Campo de status ativo/inativo
  - [x] Campo destaque
  - [x] Ordenacao manual
- [x] Melhorar configuracao do restaurante:
  - [x] WhatsApp
  - [x] Endereco
  - [x] Horario de funcionamento
  - [x] Taxa de entrega
  - [x] Texto institucional

## 6. Melhorias no Cardapio Digital

- [x] Home do pedido focada em conversao:
  - [x] Destaques
  - [x] Produtos reais
  - [x] Categorias fixas
  - [x] Carrinho claro
  - [x] Checkout curto
- [x] Melhorar cards:
  - [x] Foto/placeholder
  - [x] Nome
  - [x] Descricao curta
  - [x] Proteina/kcal/peso
  - [x] Preco
  - [x] Indicacao de sabores
- [x] Melhorar pagina do produto:
  - [x] Sabores mais organizados
  - [x] Adicionais claros
  - [x] Botao `Adicionar ao pedido`
- [x] Melhorar checkout:
  - [x] Dados pessoais
  - [x] Entrega/retirada
  - [x] Pagamento
  - [x] Resumo
  - [x] Cupom funcionando

## 7. Criar Rota `/cardapio`

- [x] Criar pagina separada para uso dentro do restaurante.
- [x] A pagina deve ser apenas visualizacao.
- [x] Nao permitir:
  - [x] Adicionar ao carrinho
  - [x] Fazer pedido
  - [x] Checkout
- [x] Exibir:
  - [x] Nome do restaurante
  - [x] Categorias
  - [x] Todos os produtos reais
  - [x] Precos
  - [x] Descricoes
  - [x] Proteina/kcal/peso
  - [x] Sabores disponiveis
- [x] Ideal para QR Code dentro do espaco fisico.
- [x] Visual diferente do delivery:
  - [x] Mais limpo
  - [x] Sem botao de compra
  - [x] Mais informativo
  - [x] Melhor para leitura rapida na mesa/balcao

## 8. Banco de Dados PostgreSQL Proprio

- [x] Usar PostgreSQL proprio da RDS como banco principal no schema `espaconisi`.
- [x] Configurar:
  - [x] `DATABASE_URL`
  - [x] Migrations Prisma
  - [x] Seed inicial
- [x] Preparar tabelas:
  - [x] Restaurant
  - [x] Category
  - [x] Product
  - [x] Flavor
  - [x] Addon
  - [x] Coupon
  - [x] Order
  - [x] OrderItem
  - [x] AnalyticsEvent
- [x] Criar/ajustar clientes:
  - [x] Usar agregacao de pedidos por telefone inicialmente
  - [x] Avaliar tabela `Customer` futuramente, caso queira CRM real

## 9. Tagamento Google e Meta

- [x] Criar base para tracking:
  - [x] Google Tag Manager
  - [x] Google Analytics 4
  - [x] Meta Pixel
- [x] Eventos recomendados:
  - [x] `PageView`
  - [x] `ViewContent`
  - [x] `AddToCart`
  - [x] `InitiateCheckout`
  - [x] `Purchase`
  - [x] `ApplyCoupon`
- [x] Variaveis de ambiente:
  - [x] `NEXT_PUBLIC_GTM_ID`
  - [x] `NEXT_PUBLIC_GA_ID`
  - [x] `NEXT_PUBLIC_META_PIXEL_ID`
- [x] Cuidados:
  - [x] Evitar expor dados sensiveis de clientes
  - [x] Enviar valor total e itens no evento de pedido
  - [x] Separar tracking do `/cardapio`, pois ele e apenas visualizacao

## 10. Ordem Recomendada de Implementacao

1. Remover produtos ficticios e manter apenas produtos reais.
2. Remover vermelho e padronizar verde.
3. Corrigir cupons no Admin.
4. Criar aba `Clientes`.
5. Criar rota `/cardapio` sem pedido.
6. Melhorar Admin visual e funcional.
7. Preparar PostgreSQL/migrations/seed.
8. Implementar Google/Meta tracking.
9. Revisar checkout e eventos.
10. Testar tudo: pedido, admin, cupom, cliente, cardapio visual e tracking.

## 11. Arquivos Principais

- `lib/db.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `components/admin/AdminDashboard.tsx`
- `components/admin/CouponManager.tsx`
- `components/admin/OrdersManager.tsx`
- `app/admin/page.tsx`
- `app/page.tsx`
- `app/checkout/page.tsx`
- `components/ProductItem.tsx`
- `components/ProductDetails.tsx`
- Nova rota: `app/cardapio/page.tsx`
- Possiveis novos componentes:
  - `components/admin/CustomersManager.tsx`
  - `components/MenuOnlyProductList.tsx`
  - `components/TrackingScripts.tsx`
