# GeoRoute

Aplicação full stack de visualização e gestão de Sistemas Autônomos (AS), com frontend em HTML/CSS/JS e backend em Express + MySQL + Prisma + JWT.

## Objetivo

Esta versão do GeoRoute conecta a interface de mapa, busca, detalhe, dashboard e administração de AS a uma API real. Os dados agora são persistidos em MySQL, e o painel administrativo funciona via CRUD autenticado.

## Tecnologias principais

- Frontend:
  - HTML5
  - CSS3
  - JavaScript Vanilla
  - Bootstrap 5
  - Leaflet
  - D3.js
  - Three.js
- Backend:
  - Node.js + Express
  - MySQL 8
  - Prisma ORM
  - JWT para autenticação
  - Swagger para documentação em `/api-docs`
- Contêiner:
  - Docker + Docker Compose

## Estrutura do projeto

- `server.js`: ponto de entrada do servidor Express
- `server/routes/`: rotas da API para auth, autonomousSystems e dashboard
- `server/controllers/`: lógica de cada endpoint
- `server/services/prismaClient.js`: cliente Prisma centralizado
- `prisma/schema.prisma`: definição do modelo de dados
- `prisma/seed.js`: script de seed inicial para popular dados e criar usuário admin
- `js/api.js`: cliente frontend para consumir a API
- `js/search.js`, `js/map.js`, `js/as_detail.js`, `js/admin.js`, `js/dashboard.js`: lógica das páginas
- `pages/`: páginas da aplicação
- `db/db.json`: base inicial usada pelo seed

## Recursos implementados

- API RESTful para listar, buscar, criar, atualizar e excluir Sistemas Autônomos
- Autenticação JWT para rotas de criação/edição/exclusão
- Dashboard com métricas agregadas
- Frontend totalmente integrado ao backend
- Swagger em `/api-docs`
- Docker Compose para rodar MySQL + API

## Pré-requisitos

- Docker
- Docker Compose
- Node.js 20+ (para execução local opcional)

## Passo a passo para executar

### Opção 1: rodar com Docker Compose (recomendado)

1. Abra o terminal na pasta do projeto.
2. Execute:

```bash
docker compose up --build
```

3. Aguarde até que o serviço `db` esteja saudável e o backend inicie.
4. Abra no navegador:

- `http://localhost:3000` → site principal
- `http://localhost:3000/api-docs` → documentação Swagger

### Opção 2: executar localmente com Node.js

1. Instale dependências:

```bash
npm install
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Ajuste a variável `DATABASE_URL` em `.env` se necessário.
4. Gere o cliente Prisma:

```bash
npm run prisma:generate
```

5. Crie ou atualize o esquema no banco:

```bash
npm run prisma:migrate
```

6. Rode o seed para popular os dados iniciais:

```bash
npm run seed
```

7. Inicie o servidor:

```bash
npm start
```

8. Acesse no navegador:

- `http://localhost:3000`
- `http://localhost:3000/api-docs`

## Usuário admin padrão

O seed inicial cria um usuário admin. Caso queira, altere o email e senha no `prisma/seed.js`.

- Email: `admin@georoute.com`
- Senha: `admin123`

## Rotas principais

- `GET /api/autonomousSystems`
- `GET /api/autonomousSystems/:id`
- `POST /api/autonomousSystems`
- `PUT /api/autonomousSystems/:id`
- `PATCH /api/autonomousSystems/:id`
- `DELETE /api/autonomousSystems/:id`
- `POST /api/auth/login`
- `GET /api/dashboard/summary`

## Observações

- A página `pages/admin.html` usa login JWT para permitir alterações de AS.
- A rota `/api/dashboard/summary` alimenta as métricas na página `pages/dashboard.html`.
- O Swagger documenta todos os endpoints disponíveis.

## Validação e testes

- Execute `npm test` para rodar os testes automatizados.
- A aplicação também disponibiliza a rota `GET /api/health` para verificação rápida de saúde.

## Artefatos de entrega

- [PRD.md](specs/PRD.md): documento de requisitos do produto.
- [AGENTS.md](AGENTS.md): convenções e orientações para desenvolvimento assistido por IA.
- [specs](specs): pasta com artefatos de análise e projeto.
