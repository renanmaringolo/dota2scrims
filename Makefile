.PHONY: up down build console test logs seed reset setup \
        backend-shell frontend-shell sidekiq-logs db-console

up: ## Inicia todos os servicos
	docker compose up -d
	@echo ""
	@echo "Backend:  http://localhost:3000"
	@echo "Frontend: http://localhost:5173"

down: ## Para todos os servicos
	docker compose down

build: ## Reconstroi todas as imagens
	docker compose build

setup: ## Setup inicial (banco, migrations, seed)
	./bin/setup

reset: ## Reset completo (apaga dados, reconstroi, setup)
	./bin/reset

console: ## Abre o Rails console no container
	docker compose exec backend rails console

backend-shell: ## Abre shell bash no container do backend
	docker compose exec backend bash

test: ## Executa testes do backend (RSpec)
	docker compose exec backend bundle exec rspec

test-file: ## Executa teste de um arquivo especifico (FILE=spec/...)
	docker compose exec backend bundle exec rspec $(FILE)

migrate: ## Executa migrations pendentes
	docker compose exec backend rails db:migrate

seed: ## Popula banco com dados iniciais
	docker compose exec backend rails db:seed

routes: ## Lista todas as rotas da API
	docker compose exec backend rails routes

frontend-shell: ## Abre shell no container do frontend
	docker compose exec frontend sh

lint: ## Executa linter no frontend
	docker compose exec frontend npm run lint

type-check: ## Verifica tipos TypeScript
	docker compose exec frontend npm run type-check

logs: ## Mostra logs de todos os servicos (follow)
	docker compose logs -f

logs-backend: ## Mostra logs do backend
	docker compose logs -f backend

logs-frontend: ## Mostra logs do frontend
	docker compose logs -f frontend

sidekiq-logs: ## Mostra logs do Sidekiq
	docker compose logs -f sidekiq

db-console: ## Abre console do PostgreSQL
	docker compose exec db psql -U dota2scrims -d dota2scrims_dev

redis-cli: ## Abre console do Redis
	docker compose exec redis redis-cli

ps: ## Lista status dos containers
	docker compose ps

help: ## Mostra essa ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
