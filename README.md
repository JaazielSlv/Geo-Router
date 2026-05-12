# GeoRoute

Aplicação front-end em React para visualização e investigação de Sistemas Autônomos (AS), mantendo o tema visual do site original e adicionando uma área completa de gerenciamento CRUD.

Este projeto passou por uma migração para React como ideiao do professor, com o objetivo de modernizar a base, organizar melhor as rotas e manter o visual original do site.


## Tecnologias

- React 18
- Vite
- React Router
- Three.js
- Leaflet
- D3.js

## Estrutura principal

- `index.html`: entrada do app React
- `src/App.jsx`: rotas e layout global
- `src/components/`: header, footer e globo 3D
- `src/pages/`: home, busca, mapa, detalhe, dashboard, sobre, contato e CRUD
- `src/context/SystemsContext.jsx`: estado compartilhado dos AS
- `src/lib/as.js`: normalização e utilitários de domínio
- `db/db.json`: base inicial dos Sistemas Autônomos

## Como os dados funcionam

O arquivo `db/db.json` continua sendo a base inicial. Na primeira execução, os dados são carregados para o estado da aplicação e persistidos no `localStorage` do navegador.

Isso permite:

- navegar entre páginas sem perder alterações
- criar novos AS
- editar registros existentes
- excluir e restaurar a base original

## Como executar

1. Instale as dependências com `npm install`.
2. Rode o ambiente de desenvolvimento com `npm run dev`.
3. Gere o build de produção com `npm run build`.

## Observações

- O visual foi mantido no mesmo eixo escuro/glass do projeto original.
- A home continua sendo a página mais imersiva, com o globo 3D em destaque.
- O mapa, o detalhe do AS e o CRUD usam os mesmos dados e o mesmo sistema de tema.
