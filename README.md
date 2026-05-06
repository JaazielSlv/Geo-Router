# GeoRoute

Aplicação front-end para visualização e investigação de Sistemas Autônomos (AS) com dados simulados via `json-server` e fallback local para leitura do `db/db.json`.

## Objetivo

O projeto mostra como uma interface Web pode consumir uma API simulada, renderizar componentes dinamicamente e organizar o código com ESM.

## Tecnologias

- HTML5
- CSS3
- JavaScript Vanilla
- Bootstrap 5.3.2
- Leaflet para o mapa
- D3.js para o grafo de detalhes
- Three.js na landing page
- `json-server` como API simulada

## Estrutura do projeto

- `index.html` e `js/index.js`: landing page com Three.js
- `pages/search.html` e `js/search.js`: busca de AS com cards criados manualmente
- `pages/map.html` e `js/map.js`: mapa interativo com Leaflet
- `pages/as_detail.html` e `js/as_detail.js`: detalhes do AS e mini-grafo com D3
- `pages/about.html`, `pages/contact.html`, `pages/dashboard.html`: páginas institucionais
- `db/db.json`: base de dados local usada pelo `json-server` e pelo fallback offline
- `js/api.js`: camada de acesso aos dados com Fetch API e operações CRUD
- `js/utils.js`: funções auxiliares compartilhadas

## Como os dados foram organizados

O arquivo `db/db.json` contém o recurso `autonomousSystems`, com registros que incluem:

- `id` e `asn`
- `org`
- `country`
- `type`
- `routes`
- `prefixes`
- `upstreams`
- `peers`
- `description`
- `lastUpdate`
- `status`
- `routeHistory`

## Consumo da API

A classe `GeoRouteApi` em `js/api.js` centraliza as requisições com `fetch`.

- `GET` para listar e buscar AS
- `POST` para criar registros
- `PUT` para atualizar totalmente
- `PATCH` para atualizar parcialmente
- `DELETE` para remover registros

Quando o `json-server` não está disponível, a leitura cai automaticamente para `db/db.json`.

## DOM e componentes dinâmicos

As telas de busca, mapa e detalhe montam a interface com `createElement`, `appendChild`, `replaceChildren` e `DocumentFragment`.

Isso permite explicar claramente o fluxo:

1. buscar dados na API
2. normalizar os registros
3. criar os elementos da interface manualmente
4. inserir no DOM

## Eventos tratados

- clique em botões de busca e filtros
- tecla Enter no campo de pesquisa
- clique em marcadores no mapa
- clique nos atalhos de AS
- carregamento da página com `DOMContentLoaded`

## ESM

O projeto usa módulos ECMAScript com `import` e `export`.

- `js/api.js` exporta a classe e a instância da API
- `js/utils.js` exporta funções reutilizáveis
- `js/search.js`, `js/map.js` e `js/as_detail.js` importam essas dependências

## Como executar

1. Instale o `json-server`.
2. Rode o servidor na pasta do projeto apontando para `db/db.json`.
3. Abra `index.html` ou as páginas dentro de `pages/`.



## Observações para apresentação

- O layout foi organizado com Bootstrap + CSS próprio.
- Os dados vêm de uma base JSON local.
- O consumo usa Fetch com fallback offline.
- A interface foi construída manualmente no JavaScript.
- O código foi separado em módulos para facilitar manutenção e explicação.