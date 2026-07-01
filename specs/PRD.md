# Product Requirements Document (PRD)

## Visão geral
O GeoRoute é uma aplicação full-stack para visualizar e gerenciar Sistemas Autônomos (AS) com backend em Express, banco de dados MySQL via Prisma e frontend em HTML/CSS/JS.

## Objetivos
- Expor dados de AS por meio de uma API REST.
- Permitir autenticação administrativa com JWT.
- Disponibilizar uma interface web para consulta, dashboard e administração.
- Facilitar execução local e via Docker.

## Funcionalidades principais
- Listagem e busca de AS.
- Detalhamento de AS.
- Dashboard com métricas.
- Login administrativo.
- CRUD de AS com autenticação.

## Critérios de aceitação
- A aplicação deve subir com Docker Compose.
- A API deve responder em /api/autonomousSystems.
- A documentação Swagger deve estar disponível em /api-docs.
- O seed deve criar usuário admin padrão.
