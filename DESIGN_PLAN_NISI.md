# Plano de Design - Espaco Vida Saudavel NISI

Objetivo: redesenhar o cardapio digital do **Espaco Vida Saudavel NISI** para vender mais, mantendo o tema atual branco + verde e posicionando o negocio como um EVS saudavel com produtos Herbalife.

## Referencias pesquisadas

- Toast recomenda imagens em nivel de item no online ordering para melhorar navegacao e experiencia; sugere imagem retangular consistente para itens.
- Toast tambem reforca que o link/botao de pedido precisa estar facil e rapido de acessar nos canais digitais.
- UpMenu recomenda categorias enxutas, destaque para best-sellers/especiais no topo e combos/bundles para aumentar ticket medio.
- Beyond Menu destaca que fotos claras e consistentes aumentam apelo no online ordering; flat lay funciona bem para bowls/saladas e angulo 45 graus e o mais versatil para pratos/bebidas.
- Sauce reforca que sites lentos ou dificeis no mobile fazem usuarios voltarem para apps terceiros; fotos, categorias organizadas e liberdade visual de marca ajudam conversao.
- Materiais de design de cardapio digital convergem em: mobile-first, decisao rapida, fotos reais, descricoes objetivas, CTA persistente e upsell contextual.

Fontes:

- Toast: `https://support.toasttab.com/en/article/How-to-Add-Images-to-an-Online-Ordering-Menu`
- Toast best practices: `https://support.toasttab.com/article/Online-Ordering-Best-Practices`
- UpMenu categorias: `https://www.upmenu.com/blog/menu-categories/`
- Beyond Menu fotos: `https://get.beyondmenu.com/blog/restaurant-photo-quality-online-order-conversion/`
- Sauce otimizacao: `https://www.getsauce.com/post/10-tips-to-optimize-your-online-ordering-menu`
- Amplify mobile-first: `https://amplifycreativelab.com/blog/complete-guide-mobile-first-menu-design/`

## Principios do novo design

- **Mobile-first real:** a maioria dos usuarios deve chegar pelo Instagram/WhatsApp; tudo precisa caber bem na tela pequena.
- **Decisao em ate 10 segundos:** mostrar primeiro best-sellers, combos e beneficios rapidos.
- **Tema branco + verde:** fundo branco/quase branco, verde como acento principal, cinzas quentes para texto e bordas discretas.
- **EVS, nao fast-food:** linguagem leve, saudavel e acolhedora; evitar visual agressivo de delivery comum.
- **Fotos vendem:** priorizar fotos reais de shakes, bebidas, combos e lanches. Itens sem foto devem ter placeholder elegante, nao parecer incompleto.
- **Menos categorias, mais clareza:** 5 a 7 categorias principais; as mais lucrativas/importantes ficam antes.
- **Upsell sem atrito:** adicionais aparecem no detalhe do produto e no carrinho, mas sem interromper o usuario.
- **Sem promessas medicas:** usar “apoia sua rotina”, “proteico”, “leve”, “energia”, “fibra”, “bem-estar”; evitar “emagrece”, “cura”, “garante resultado”.

## Paleta e estilo

- Fundo principal: `#F8FBF8` ou branco.
- Verde principal: `#16803C` (atual).
- Verde claro: `#EAF7EF`.
- Verde escuro texto/acento: `#0F5130`.
- Texto principal: `#17231B`.
- Texto secundario: `#5F6F65`.
- Bordas: `rgba(15, 81, 48, 0.12)`.
- Alertas/desconto: manter verde ou amarelo suave apenas quando necessario.

Estilo:

- Cards com radius maximo de 8px.
- Poucas sombras, mais bordas limpas.
- Fotos com aspecto consistente: item `4:3` ou `5:4`; hero/banner mais horizontal.
- Icones lucide em controles e sinais de confianca.
- Animacoes curtas: `150ms-250ms`, hover sutil, entrada por scroll discreta.

## Nova arquitetura da home

### 1) Header EVS

- Nome: `Espaco Vida Saudavel NISI`.
- Subtitulo: `Shakes, bebidas funcionais e opcoes proteicas para uma rotina mais leve.`
- Sinais rapidos:
  - Atendimento personalizado
  - Opcoes proteicas
  - Energia para a rotina
  - Retirada/entrega
- CTA visual abaixo do header:
  - `Ver combos`
  - `Montar meu pedido`

Checklist:

- [x] Header com imagem real/ambiente quando houver banner.
- [x] Fallback visual branco/verde quando nao houver imagem.
- [x] Selo “Espaco Vida Saudavel”.
- [x] Copy responsavel sem promessa medica.

### 2) Faixa de destaques

Criar uma secao antes das categorias:

- `Mais pedidos`
- `Combos do dia`
- `Para energia`
- `Para proteina`

Cada card deve ter:

- Foto ou placeholder.
- Badge curto: `Mais pedido`, `Proteico`, `Energia`, `Combo`.
- Nome curto.
- Preco claro.
- CTA pequeno: `Adicionar` ou `Ver`.

Checklist:

- [x] Criar lista de featured products via filtro simples (primeiros produtos ou flag futura).
- [x] Cards horizontais no mobile.
- [x] Evitar carrossel escondido demais; mostrar parte do proximo card.

### 3) Categorias enxutas e orientadas por objetivo

Ordem sugerida:

1. Combos do Dia
2. Mais Pedidos
3. Shakes Nutritivos
4. Bebidas Funcionais
5. Chas e Energia
6. Proteicos
7. Lanches Saudaveis

Checklist:

- [x] Mostrar categoria ativa com underline verde.
- [x] Manter barra fixa no topo.
- [x] Evitar excesso de categorias visiveis.
- [x] Permitir categorias sem produtos ficarem ocultas.

### 4) Cards de produto

Card ideal:

- Foto a direita no mobile e/ou topo em grid desktop.
- Nome forte.
- Descricao curta em 1-2 linhas.
- Badges nutricionais quando houver dados:
  - `Xg proteina`
  - `X kcal`
  - `X ml`
- Preco destacado em verde.
- Microcopy de personalizacao se houver adicionais/sabores.

Checklist:

- [x] Criar badges visuais para proteina/caloria/volume.
- [x] Indicar quando produto tem sabores/adicionais.
- [x] Melhorar placeholder de imagem.
- [x] Evitar texto longo no card.

## Produto/detalhe

Objetivo: fazer a escolha parecer simples, personalizada e saudavel.

Estrutura:

- Foto grande.
- Nome + descricao.
- Beneficios/badges em linha: proteina, kcal, volume, peso.
- Secao `Escolha seu sabor`.
- Secao `Adicionais para sua rotina`.
- CTA fixo inferior: `Adicionar ao pedido`.

Checklist:

- [x] Trocar “Detalhes da opcao” por titulo mais natural no header.
- [x] Mostrar nomes de adicionais com preco e beneficio curto quando possivel.
- [x] Disabled state do CTA deve explicar que precisa escolher sabor.
- [x] Lightbox com ESC e lock de scroll.

## Carrinho

Objetivo: reduzir abandono e reforcar valor.

Estrutura:

- Titulo: `Seu pedido no NISI`.
- Itens com nome, sabor, adicionais, subtotal correto.
- Bloco pequeno: `Finalize pelo WhatsApp com o resumo pronto`.
- CTA: `Continuar para checkout`.

Checklist:

- [x] Ajustar titulo e copy.
- [x] Mostrar total sempre visivel.
- [x] Inserir sugestao sutil de adicional/combos quando carrinho baixo.
- [x] Evitar emoji no texto principal.

## Checkout

Objetivo: checkout curto, confiavel e sem cara burocratica.

Estrutura recomendada:

1. Dados
2. Entrega/Retirada
3. Pagamento
4. Resumo

Melhorias:

- Stepper visual compacto.
- Resumo fixo no final do mobile; lateral no desktop.
- Cupom perto do resumo, nao perdido no meio.
- Texto: `Vamos preparar seu pedido no NISI`.

Checklist:

- [x] Criar stepper compacto.
- [x] Mover resumo para bloco mais destacado.
- [x] Cupom dentro do resumo.
- [x] Validar telefone/CEP antes de submit.
- [ ] Persistir metodo entrega no DB futuramente.

## Admin

Objetivo: operacional, rapido e limpo.

Melhorias:

- Usar branco + verde tambem no painel.
- Tabs com estado ativo verde.
- Pedidos com status claros.
- Produtos com preview de foto e badges.
- Cupons com estado ativo/inativo mais legivel.

Checklist:

- [x] Remover vermelho hardcoded do admin.
- [x] Limpar warnings de lint remanescentes.
- [x] Converter imagens restantes para `next/image`.

## Prioridade de implementacao

1. Home EVS: header, destaque e cards com badges.
2. Produto/detalhe: CTA e personalizacao mais clara.
3. Carrinho: copy NISI e total/upsell.
4. Checkout: stepper + resumo melhor.
5. Admin: tema verde e limpeza de warnings.
