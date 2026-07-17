# Plano de CRM Avancado do Admin NISI

Objetivo: evoluir a aba de clientes do admin para um CRM pratico, baseado no telefone do cliente, capaz de mostrar perfil de compra, etiquetas automaticas, acoes rapidas no WhatsApp, inteligencia de produtos e cupons segmentados.

Escopo aprovado:

- Etiquetas e segmentacao de clientes.
- Acoes prontas de WhatsApp.
- Perfil completo do cliente baseado no numero de telefone.
- Inteligencia de produtos por cliente e por recorrencia.
- Cupons vinculados a segmentos.

Fora do escopo imediato:

- Campanhas automaticas completas dentro do admin.
- Disparo em massa.
- Automacao externa de WhatsApp.
- CRM com login individual de cliente.

## 1. Diagnostico Atual

Hoje a aba de clientes ja agrega compradores por telefone e mostra:

- nome;
- telefone;
- endereco mais recente;
- quantidade de pedidos;
- ultimo pedido;
- total comprado;
- historico de pedidos;
- atalho para WhatsApp;
- exportacao CSV.

Isso e uma boa base, mas ainda funciona mais como relatorio de compradores do que como CRM. O proximo passo e transformar esses dados em leitura de comportamento e acoes comerciais.

## 2. Regra Central: Cliente Por Telefone

O identificador principal do cliente sera o telefone.

Todo perfil, historico, etiqueta e cupom segmentado deve considerar o campo `customerPhone`.

Regras:

- normalizar telefone removendo espacos, parenteses, tracos e simbolos;
- tratar telefones com e sem codigo do Brasil como o mesmo contato quando possivel;
- agrupar todos os pedidos nao cancelados pelo telefone;
- usar o pedido mais recente para nome e endereco principal;
- manter pedidos cancelados fora dos indicadores comerciais principais, mas permitir exibicao no historico se for util para atendimento.

## 3. Etiquetas Automaticas de Clientes

Criar etiquetas calculadas automaticamente no admin, sem exigir cadastro manual.

### Etiquetas iniciais

- `Novo cliente`: cliente com apenas 1 pedido.
- `Recorrente`: cliente com 2 ou mais pedidos.
- `VIP`: cliente acima de um valor definido de gasto total, por exemplo R$ 150 ou R$ 200.
- `Alto ticket`: cliente com ticket medio acima da media geral.
- `Inativo`: cliente sem compra ha 30 dias.
- `Quase inativo`: cliente sem compra entre 15 e 29 dias.
- `Comprou shake`: cliente que ja comprou produto com nome/categoria relacionada a shake.
- `Comprou salgado`: cliente que ja comprou empada, pao de queijo, sanduiche, omelete ou torta.
- `Comprou bebida funcional`: cliente que ja comprou cha, detox, turbo ou bebida funcional.
- `Prefere entrega`: maioria dos pedidos via entrega.
- `Prefere retirada`: maioria dos pedidos via retirada.
- `Cliente de bairro`: etiqueta mostrando o bairro principal do cliente.

### Onde mostrar

- Na tabela de clientes, logo abaixo do nome.
- No modal de perfil do cliente.
- Em filtros rapidos no topo da aba Clientes.
- Na exportacao CSV.

### Filtros recomendados

- Todos.
- Novos.
- Recorrentes.
- VIP.
- Inativos.
- Alto ticket.
- Compraram shake.
- Compraram salgados.
- Entrega.
- Retirada.

## 4. Perfil Completo do Cliente

Ao clicar no cliente, o modal deve virar um perfil comercial completo.

### Dados principais

- Nome.
- Telefone formatado.
- Endereco mais recente.
- Bairro.
- Tipo preferido: entrega ou retirada.
- Total gasto.
- Quantidade de pedidos.
- Ticket medio.
- Data do primeiro pedido.
- Data do ultimo pedido.
- Dias desde a ultima compra.

### Historico e preferencias

- Lista de pedidos do cliente.
- Produtos comprados em cada pedido.
- Produto mais comprado.
- Categoria mais comprada.
- Sabores mais pedidos, quando houver.
- Adicionais mais usados, quando houver.
- Horario/dia com maior recorrencia, se houver dados suficientes.

### Indicadores comerciais

- Status do cliente: novo, recorrente, VIP ou inativo.
- Probabilidade de recompra simples:
  - alta: comprou recentemente e tem recorrencia;
  - media: comprou mais de uma vez, mas esta ha alguns dias sem comprar;
  - baixa: comprou uma vez ou esta inativo.
- Sugestao de abordagem:
  - "mandar agradecimento";
  - "oferecer produto favorito";
  - "enviar cupom de retorno";
  - "pedir avaliacao no Google";
  - "sugerir combo".

## 5. Acoes Prontas de WhatsApp

Adicionar botoes no perfil do cliente e na tabela.

### Acoes iniciais

1. Agradecer compra.
2. Pedir avaliacao no Google.
3. Oferecer produto favorito.
4. Chamar cliente inativo.
5. Enviar cupom de retorno.
6. Enviar cupom VIP.
7. Sugerir combo saudavel.
8. Confirmar preferencia de entrega/retirada.

### Exemplos de mensagens

#### Agradecer compra

`Oi, {nome}! Aqui e do Espaco Vida Saudavel NISI. Passando para agradecer seu pedido de hoje. Esperamos que tenha gostado.`

#### Pedir avaliacao

`Oi, {nome}! Que bom ter voce com a gente no NISI. Se puder, sua avaliacao no Google ajuda muito nosso espaco a crescer: {link_google}`

#### Produto favorito

`Oi, {nome}! Vi que voce gosta bastante de {produto_favorito}. Hoje estamos atendendo normalmente, quer que eu separe um para voce?`

#### Cliente inativo

`Oi, {nome}! Faz um tempinho que voce nao aparece no NISI. Hoje temos opcoes leves e proteicas para sua rotina. Quer ver as sugestoes do dia?`

#### Cupom de retorno

`Oi, {nome}! Preparamos um cupom para sua proxima compra no NISI: {codigo_cupom}. Ele vale para pedidos pelo nosso cardapio digital.`

### Regras de UX

- O botao deve abrir `wa.me` com texto pronto.
- O usuario do admin pode editar a mensagem antes de enviar.
- Cada mensagem deve usar nome e dados reais do cliente quando disponiveis.
- Se nao houver produto favorito, usar uma mensagem generica de sugestao.

## 6. Inteligencia de Produtos

Adicionar leitura de produtos dentro do perfil do cliente e na visao geral do admin.

### Por cliente

- Produto mais comprado.
- Top 3 produtos do cliente.
- Categoria favorita.
- Sabores preferidos.
- Produtos nunca comprados, mas relacionados ao perfil.
- Sugestao de proxima compra.

### Por base de clientes

- Produtos mais recomprados.
- Produtos com maior ticket medio.
- Produtos que geram mais clientes recorrentes.
- Produtos muito vistos e pouco comprados.
- Produtos que aparecem mais em pedidos de clientes VIP.

### Uso pratico

- destacar produtos bons para recompra;
- montar combos;
- criar cupons mais inteligentes;
- sugerir mensagem personalizada no WhatsApp;
- decidir quais produtos colocar em destaque no cardapio.

## 7. Cupons Por Segmento

Evoluir cupons para trabalhar com clientes e etiquetas.

### Novas regras de cupom

- cupom para primeira compra;
- cupom para cliente recorrente;
- cupom para cliente VIP;
- cupom para cliente inativo;
- cupom por bairro;
- cupom por produto/categoria;
- cupom limitado por telefone;
- cupom com validade curta para retorno.

### Campos recomendados

- segmento alvo;
- limite por telefone;
- validade;
- pedido minimo;
- produtos/categorias elegiveis;
- mensagem pronta para WhatsApp;
- quantidade de usos;
- receita gerada pelo cupom.

### Relatorio de cupons

Mostrar na aba Cupons:

- clientes que usaram;
- receita gerada;
- ticket medio com cupom;
- segmento que mais converteu;
- cupons ativos para CRM.

## 8. Mudancas Tecnicas Necessarias

### Camada de dados

Criar uma funcao de agregacao de CRM, por exemplo:

- `getCustomerProfiles()`
- `getCustomerSegments()`
- `getCustomerProductInsights(phone)`

Essas funcoes devem calcular:

- total de pedidos;
- total gasto;
- ticket medio;
- primeiro pedido;
- ultimo pedido;
- dias sem comprar;
- produtos comprados;
- categorias compradas;
- sabores/adicionais;
- metodo de entrega predominante;
- etiquetas automaticas.

### Possiveis alteracoes no banco

Para a primeira versao, da para calcular tudo a partir de `Order` e `OrderItem`.

Para uma versao mais avancada, criar tabelas:

- `CustomerNote`: anotacoes internas do cliente.
- `CustomerTag`: etiquetas manuais.
- `CustomerConsent`: consentimento para marketing.
- `CouponCustomerRule`: regras de cupom por telefone/segmento.

### Privacidade e LGPD

Adicionar controle minimo:

- consentimento para mensagens promocionais;
- data do consentimento;
- opt-out de WhatsApp;
- texto no checkout explicando uso de dados para atendimento e relacionamento.

## 9. Fases de Implementacao

### Fase 1: CRM visual sem alterar banco

- Criar etiquetas automaticas.
- Melhorar tabela de clientes.
- Melhorar perfil do cliente.
- Mostrar produto favorito, ticket medio e dias desde a ultima compra.
- Criar filtros por etiquetas.
- Criar acoes prontas de WhatsApp.

Resultado: CRM funcional usando os dados que ja existem.

### Fase 2: Inteligencia comercial

- Criar insights de produtos por cliente.
- Criar ranking de produtos por recompra.
- Mostrar sugestao de proxima compra.
- Adicionar recomendacoes dentro do perfil do cliente.
- Adicionar exportacao com etiquetas e insights.

Resultado: o admin passa a orientar venda e recompra.

### Fase 3: Cupons segmentados

- Adicionar regra de cupom por segmento.
- Adicionar limite por telefone.
- Criar mensagens de WhatsApp conectadas ao cupom.
- Mostrar performance do cupom por segmento.

Resultado: cupons deixam de ser genericos e viram ferramenta de retencao.

### Fase 4: Estrutura persistente de CRM

- Criar anotacoes internas por cliente.
- Criar etiquetas manuais.
- Criar consentimento de marketing.
- Criar historico de contato.

Resultado: CRM mais completo, com memoria comercial alem dos pedidos.

## 10. Recomendacoes Extras

### 10.1 Anotacoes internas

Permitir que o admin salve observacoes como:

- "prefere retirar";
- "sempre pede sem adicional";
- "cliente pediu para avisar quando tiver promocao";
- "mora perto";
- "gosta de shake de coco".

### 10.2 Historico de contato

Registrar quando o admin clicou em uma acao de WhatsApp:

- tipo de mensagem;
- data;
- cliente;
- cupom enviado, se houver.

Isso ajuda a evitar abordar a mesma pessoa varias vezes no mesmo dia.

### 10.3 Score de relacionamento

Criar uma pontuacao simples:

- +10 por pedido entregue;
- +20 por recompra;
- +15 por ticket acima da media;
- -10 por inatividade acima de 30 dias;
- -20 por inatividade acima de 60 dias.

Usar o score para classificar clientes em:

- quente;
- morno;
- frio;
- VIP.

### 10.4 Alertas no painel inicial

Adicionar cards como:

- clientes VIP sem compra ha 15 dias;
- clientes novos que ainda nao recompraram;
- clientes que podem receber pedido de avaliacao;
- cupons vencendo hoje;
- produto favorito dos VIPs esta inativo ou sem foto.

### 10.5 Consentimento no checkout

Adicionar um checkbox opcional:

`Quero receber novidades e ofertas do Espaco Vida Saudavel NISI pelo WhatsApp.`

Isso fortalece o uso comercial dos dados.

### 10.6 Lista de oportunidades

Criar uma secao chamada `Oportunidades de hoje`:

- 5 clientes inativos para chamar;
- 5 clientes recorrentes para oferecer combo;
- 5 clientes recentes para pedir avaliacao;
- clientes com produto favorito em destaque.

### 10.7 Recompra inteligente

Se um cliente costuma comprar a cada 7 dias, o admin pode mostrar:

`Cliente costuma recomprar a cada 7 dias. Ja esta ha 9 dias sem pedido.`

### 10.8 Relatorio de bairros

Mostrar bairros com mais clientes, pedidos e receita.

Uso pratico:

- criar campanhas por regiao;
- decidir taxa de entrega;
- entender onde o NISI tem mais tracao.

## 11. Prioridade Recomendada

1. Etiquetas automaticas e filtros.
2. Perfil do cliente completo por telefone.
3. Acoes prontas de WhatsApp.
4. Produto favorito e sugestao de proxima compra.
5. Cupons por segmento.
6. Anotacoes internas.
7. Consentimento e opt-out.
8. Historico de contato.
9. Oportunidades de hoje.
10. Score de relacionamento.

## 12. Resultado Esperado

Com esse plano, o admin deixa de ser apenas controle operacional e passa a responder perguntas comerciais importantes:

- quem compra mais;
- quem esta sumido;
- quem merece cupom;
- quem pode avaliar no Google;
- qual produto vender para cada cliente;
- quais produtos geram recompra;
- quais clientes devem ser chamados hoje;
- quais cupons realmente trazem receita.

O foco e simples: usar os dados dos pedidos para aumentar recompra, melhorar relacionamento e dar mais clareza para quem opera o NISI no dia a dia.
