# Plano de Refatoracao - Admin e Pagina do Produto NISI

Objetivo: transformar o admin em uma ferramenta mais clara, bonita e rapida de operar, e deixar a pagina interna do produto mais moderna, visual e persuasiva, mantendo o tema branco/verde do Espaco Vida Saudavel NISI.

## 1. Direcao Visual Geral

- [x] Manter paleta principal branca e verde.
- [x] Usar cinzas suaves para areas secundarias.
- [x] Evitar vermelho e azul em estados comuns.
- [x] Reservar cores fortes apenas para estados realmente importantes.
- [x] Padronizar:
  - Cards
  - Tabelas
  - Formularios
  - Abas
  - Botoes
  - Badges
  - Estados vazios
- [x] Criar uma sensacao mais premium e organizada, sem deixar o admin pesado.

## 2. Refatoracao Geral do Admin

- [x] Trocar layout atual por uma estrutura mais profissional:
  - Sidebar fixa no desktop
  - Navegacao inferior ou menu compacto no mobile
  - Topbar com nome do restaurante, status e atalhos
  - Area de conteudo com largura melhor aproveitada
- [x] Criar um componente base para paginas do admin:
  - Titulo
  - Subtitulo
  - Acoes principais
  - Cards de resumo
  - Conteudo principal
- [x] Padronizar todas as abas com a mesma linguagem visual.
- [x] Melhorar responsividade das tabelas e formularios.
- [x] Criar estados de loading, vazio e erro mais bonitos.
- [x] Adicionar microcopy objetiva para orientar quem usa o admin.

## 3. Abas do Admin

### 3.1 Visao Geral

- [x] Melhorar cards de metricas:
  - Pedidos do dia
  - Receita do dia
  - Pedidos pendentes
  - Produtos ativos
  - Clientes recorrentes
  - Conversao do checkout
- [x] Criar bloco de acoes rapidas:
  - Novo produto
  - Ver pedidos pendentes
  - Criar cupom
  - Editar horario
- [x] Melhorar graficos:
  - Receita por dia
  - Origem dos acessos
  - Funil de conversao
  - Produtos mais vistos
- [x] Criar lista de alertas operacionais:
  - Produtos sem foto
  - Cupons vencidos
  - Pedidos pendentes
  - Produtos inativos

### 3.2 Pedidos

- [x] Transformar lista em uma tela operacional.
- [x] Criar filtros por:
  - Status
  - Data
  - Entrega ou retirada
  - Forma de pagamento
- [x] Criar busca por:
  - Nome
  - Telefone
  - Codigo do pedido
- [x] Melhorar card/linha do pedido:
  - Status destacado
  - Cliente
  - Total
  - Tipo de atendimento
  - Hora do pedido
- [x] Criar painel de detalhes mais claro:
  - Itens do pedido
  - Dados do cliente
  - Endereco
  - Pagamento
  - Observacoes
- [x] Melhorar botoes de status:
  - Confirmar
  - Entregue
  - Cancelar
- [x] Preparar para futura integracao com WhatsApp.

### 3.3 Clientes

- [x] Melhorar tabela de clientes.
- [x] Criar cards de resumo:
  - Total de clientes
  - Clientes recorrentes
  - Ticket medio
  - Cliente com mais pedidos
- [x] Criar busca e filtros:
  - Nome
  - Telefone
  - Bairro
  - Recorrentes
- [x] Criar detalhes do cliente:
  - Ultimo pedido
  - Total comprado
  - Historico de pedidos
  - Endereco mais recente
- [x] Preparar estrutura para CRM futuro.

### 3.4 Produtos

- [x] Refatorar tela inteira de produtos.
- [x] Criar visual em duas camadas:
  - Lista/catalogo de produtos
  - Drawer/modal para criar ou editar
- [x] Melhorar listagem:
  - Foto ou placeholder
  - Nome
  - Categoria
  - Preco
  - Status ativo/inativo
  - Destaque
  - Ordem
- [x] Criar filtros:
  - Categoria
  - Ativo/inativo
  - Destaques
  - Produtos sem foto
- [x] Criar busca por nome.
- [x] Melhorar formulario:
  - Secao de informacoes basicas
  - Secao de midia
  - Secao nutricional
  - Secao de sabores
  - Secao de adicionais
  - Secao de visibilidade
- [x] Melhorar upload e preview de imagem.
- [x] Criar avisos para produto sem foto ou sem descricao.
- [x] Melhorar ordenacao manual.

### 3.5 Categorias

- [x] Melhorar listagem de categorias.
- [x] Mostrar quantidade de produtos por categoria.
- [x] Melhorar reordenacao com setas mais claras.
- [x] Preparar drag and drop futuramente.
- [x] Criar aviso antes de excluir categoria com produtos.

### 3.6 Cupons

- [x] Melhorar listagem de cupons.
- [x] Criar cards de status:
  - Cupons ativos
  - Cupons inativos
  - Cupons vencidos
  - Usos totais
- [x] Melhorar formulario:
  - Codigo
  - Tipo
  - Valor
  - Pedido minimo
  - Limite de usos
  - Validade
  - Status
- [x] Mostrar regras do cupom de forma escaneavel.
- [x] Criar estados visuais para ativo, inativo e vencido.

### 3.7 Configuracoes

- [x] Separar configuracoes do restaurante em blocos:
  - Identidade
  - Atendimento
  - Entrega
  - WhatsApp
  - Midia
  - Textos institucionais
- [x] Melhorar formulario de restaurante.
- [x] Adicionar preview do cabecalho do site.
- [x] Melhorar upload de logo e banner.
- [x] Preparar configuracoes para:
  - Horario de funcionamento
  - Taxa de entrega
  - Endereco
  - WhatsApp
  - Status aberto/fechado futuramente

## 4. Componentizacao do Admin

- [x] Criar `AdminShell`.
- [x] Criar `AdminSidebar`.
- [x] Criar `AdminTopbar`.
- [x] Criar `AdminPageHeader`.
- [x] Criar `AdminStatCard`.
- [x] Criar `AdminEmptyState`.
- [x] Criar `AdminTable`.
- [x] Criar `AdminBadge`.
- [x] Criar `AdminSection`.
- [x] Reaproveitar componentes entre abas para reduzir duplicacao.

## 5. Pagina Interna do Produto

- [x] Redesenhar a pagina `/product/[slug]`.
- [x] Criar topo mais visual:
  - Foto grande
  - Botao voltar
  - Badge de categoria
  - Badge de destaque ou proteico
- [x] Melhorar area principal:
  - Nome do produto
  - Descricao
  - Preco
  - Peso/volume
  - Proteina
  - Calorias
- [x] Criar cards pequenos para informacoes nutricionais.
- [x] Melhorar selecao de sabores:
  - Visual em chips/cards
  - Estado selecionado bem claro
  - Obrigatoriedade bem comunicada
- [x] Melhorar adicionais:
  - Cards com nome, descricao curta e preco
  - Estado selecionado claro
  - Suporte a escolha unica ou multipla
- [x] Melhorar seletor de quantidade.
- [x] Melhorar barra fixa inferior:
  - Quantidade
  - Total
  - Botao adicionar ao pedido
- [x] Criar bloco de confianca:
  - Produto do Espaco Vida Saudavel NISI
  - Preparado no atendimento
  - Entrega ou retirada
- [x] Criar sugestoes relacionadas:
  - Produtos da mesma categoria
  - Shakes ou bebidas para acompanhar
- [x] Melhorar lightbox da imagem.
- [x] Garantir experiencia excelente no mobile.

## 6. Conversao e UX

- [x] Reduzir atrito para adicionar produto ao carrinho.
- [x] Deixar claro quando sabor e obrigatorio.
- [x] Mostrar total atualizado em tempo real.
- [x] Facilitar retorno ao cardapio.
- [x] Melhorar legibilidade das descricoes.
- [x] Evitar excesso de texto visivel.
- [x] Reforcar beneficios nutricionais sem promessas medicas.
- [x] Manter todos os CTAs em verde.

## 7. Performance e Qualidade

- [x] Evitar componentes client desnecessarios.
- [x] Separar componentes server/client quando fizer sentido.
- [x] Reduzir duplicacao de estilos.
- [x] Reaproveitar helpers de preco, badges e metadados de produto.
- [x] Manter imagens otimizadas e com dimensoes estaveis.
- [x] Testar mobile e desktop.
- [x] Rodar:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`

## 8. Ordem Recomendada de Execucao

1. Criar componentes base do admin.
2. Refatorar layout geral do admin.
3. Refatorar Visao Geral.
4. Refatorar Pedidos.
5. Refatorar Clientes.
6. Refatorar Produtos.
7. Refatorar Categorias.
8. Refatorar Cupons.
9. Refatorar Configuracoes.
10. Redesenhar pagina interna do produto.
11. Revisar responsividade mobile.
12. Rodar validacoes finais.

## 9. Resultado Esperado

- Admin mais bonito, limpo e profissional.
- Menos confusao para operar pedidos, produtos e cupons.
- Pagina de produto mais moderna e persuasiva.
- Melhor experiencia no celular.
- Base visual mais consistente para futuras melhorias, como WhatsApp, CRM e relatorios.
