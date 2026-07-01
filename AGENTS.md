# AGENTS.md

## Convenções de desenvolvimento
- Manter o backend em Express modularizado por rotas, controllers e middlewares.
- Usar Prisma para acesso ao banco e manter o schema em prisma/schema.prisma.
- Guardar configuração sensível em variáveis de ambiente e não versionar arquivos .env.
- Priorizar documentação clara, testes automatizados e execução via Docker.
- Sempre validar a aplicação com os comandos de teste ou execução antes de encerrar a tarefa.
