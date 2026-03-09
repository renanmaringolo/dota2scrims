# CLAUDE.md

Dota2Scrims — plataforma de agendamento de scrims para a equipe Avalanche eSports (Dota 2).
Monorepo fullstack com Rails 8 API + React 18 SPA, orquestrado via Docker Compose.

## Stack

| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Ruby | 3.3 | Linguagem backend |
| Rails | 8.x | API mode (sem views) |
| PostgreSQL | 16 | Banco principal (enums nativos) |
| Redis | 7 | Action Cable adapter + Sidekiq backend |
| Sidekiq | latest | Background jobs (emails, cleanup) |
| Action Cable | Rails 8 | WebSocket real-time |
| Devise + devise-jwt | latest | Auth JWT com JTI revocation |
| React | 18.3 | SPA frontend |
| TypeScript | 5.4 | Type-safety |
| Vite | 5.x | Bundler + HMR |
| Tailwind CSS | 3.4 | Utility-first styling |
| Shadcn/ui | latest | Componentes acessiveis |
| Zustand | 4.5 | Client state |
| TanStack Query | 5.x | Server state + cache |
| React Hook Form + Zod | latest | Forms + validacao |

## Arquitetura

```
dota2scrims/
├── backend/                  # Rails 8 API
│   ├── app/
│   │   ├── controllers/api/  # Thin controllers (rescue exceptions)
│   │   ├── models/           # Validacoes, associations, scopes, enums
│   │   ├── operations/       # TODA logica de negocio (BaseOperation)
│   │   ├── services/         # EXCLUSIVAMENTE comunicacao externa (BaseService)
│   │   ├── channels/         # Action Cable (ScrimChannel)
│   │   ├── mailers/          # Action Mailer
│   │   └── jobs/             # Sidekiq workers
│   ├── config/
│   ├── db/
│   └── spec/                 # RSpec
├── frontend/                 # React 18 + TypeScript
│   ├── src/
│   │   ├── app/              # Routes, layouts, providers
│   │   ├── components/       # UI (shadcn), calendar, team, booking, admin
│   │   ├── hooks/            # Custom hooks (useAuth, useCable, useSlots)
│   │   ├── services/         # API clients (axios/fetch)
│   │   ├── stores/           # Zustand stores (auth, calendar)
│   │   └── types/            # TypeScript types
│   └── package.json
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── Makefile
```

### Padrao Arquitetural (Clean Architecture)

- **Controllers**: camada fina. Captura exceptions das Operations, retorna HTTP responses
- **Operations**: TODA logica de negocio. Herdam de `BaseOperation`. Lancam exceptions customizadas
- **Services**: EXCLUSIVAMENTE comunicacao externa (email, WebSocket broadcast). Herdam de `BaseService`
- **Models**: validacoes, associations, scopes, enums. SEM logica de negocio complexa

Regras detalhadas em `.claude/rules/architecture.md`.

## Comandos de Desenvolvimento

**IMPORTANT**: Todo comando Ruby (`bundle exec`, `rspec`, `rubocop`, `rails`) DEVE ser executado via Docker.

```bash
# Docker
docker compose up                                                    # Subir todos os servicos
docker compose up -d                                                 # Background
docker compose down                                                  # Parar tudo
docker compose down -v                                               # Parar + limpar volumes

# Backend (SEMPRE via docker)
docker compose exec backend bundle exec rspec spec/path/file_spec.rb       # Teste especifico
docker compose exec backend bundle exec rspec spec/path/file_spec.rb:42    # Linha especifica
docker compose exec backend bundle exec rubocop                            # Lint Ruby
docker compose exec backend bundle exec rubocop -a                         # Lint auto-fix
docker compose exec backend rails console                                  # Console Rails
docker compose exec backend rails db:migrate                               # Rodar migrations
docker compose exec backend rails db:seed                                  # Seed data

# Frontend (host ou docker)
cd frontend && npm run dev                                           # Dev server
cd frontend && npm run test                                          # Vitest
cd frontend && npm run lint                                          # ESLint
cd frontend && npm run lint:fix                                      # ESLint auto-fix
cd frontend && npx tsc --noEmit                                      # Type check
```

**Portas Docker**: 3000 (Rails), 5173 (Vite), 5432 (PostgreSQL), 6379 (Redis).

## Padroes de Codigo

- **Operations**: logica de negocio em `NomeDominio::NomeOperation < BaseOperation`, metodo `#call`
- **Services**: comunicacao externa em `NomeService < BaseService`, metodos de classe
- **Thin Controllers**: delegam para Operations, strong params via `#permit`
- **Models**: validacoes + associations + scopes + enums. Logica complexa vai para Operations
- **Errors**: exceptions customizadas herdam de `Errors::BaseError` com `to_error_hash`
- **API responses**: `{ data: ..., meta: ... }` para sucesso, `{ error: { status, status_text, code, message } }` para erro
- **PATCH** para updates parciais, **POST /cancel** para cancelamentos (state transition)
- **PostgreSQL enums** nativos (nao integers)
- **Bigint** como PK (padrao Rails 8)

Para regras detalhadas de estilo, confiar no RuboCop (Ruby) e ESLint + Prettier (TypeScript).

Regras detalhadas em `.claude/rules/code-style.md`.

## TDD — Obrigatorio para Agentes Desenvolvedores

**IMPORTANT**: Agentes que escrevem codigo neste projeto DEVEM seguir TDD (Red-Green-Refactor). Sem excecoes.

1. **Red** — Escrever o teste ANTES da implementacao. O teste DEVE falhar.
2. **Green** — Escrever o codigo MINIMO que faz o teste passar.
3. **Refactor** — Melhorar o codigo SOMENTE depois de todos os testes passarem.

**Regras**:
- NUNCA escrever implementacao sem um teste falhando primeiro
- Rodar os testes a cada ciclo para confirmar red/green
- Cada ciclo deve ser pequeno e incremental

Regras detalhadas em `.claude/rules/tdd.md`.

## Documentacao do Projeto

Toda documentacao tecnica esta em `.local/` (ignorada pelo git):

```
.local/
├── prd/           # PRD completo (scrims-prd.md)
├── architecture/  # architecture-doc.md, database-schema.md, api-contracts.md
├── frontend/      # frontend-strategy.md, component-map.md
├── devops/        # docker-strategy.md, cicd-pipeline.md
├── qa/            # testing-strategy.md
├── research/      # tech-decisions.md
├── cards/         # card-plan.md, audit/
├── prompts/       # Outputs do /prompter
└── specs/         # Outputs do @spec-writer
```

## Pull Requests

**Título**: `[CARD-NNN] <emoji> <descrição em português>`

| Emoji | Tipo | Emoji | Tipo |
|-------|------|-------|------|
| ✨ | `feat` | 🔧 | `chore` |
| 🐛 | `fix` | 📦 | `build` |
| 🚀 | `enhancement` | 🎨 | `style` |
| ♻️ | `refactor` | ⚡ | `perf` |
| 🧪 | `test` | 🔒 | `security` |
| 🗃️ | `db` | 🗑️ | `remove` |

- Template em `.github/PULL_REQUEST_TEMPLATE.md`
- Regras detalhadas em `.claude/rules/pull-requests.md`
- Um PR por story, branch `feat/card-NNN-descricao-curta`
- Reviewer interno aprova ANTES de abrir o PR
- `Closes #N` para vincular issues automaticamente

## Board GitHub

19 stories organizadas em 5 fases no repo `renanmaringolo/dota2scrims`.
Card plan em `.local/cards/card-plan.md`. Audit em `.local/cards/audit/`.
