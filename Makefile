.PHONY: up down setup reset logs backend-console backend-test backend-lint frontend-test frontend-lint db-migrate db-seed

up:
	docker compose up

up-d:
	docker compose up -d

down:
	docker compose down

setup:
	./bin/setup

reset:
	./bin/reset

logs:
	docker compose logs -f

backend-console:
	docker compose exec backend rails console

backend-test:
	docker compose exec backend bundle exec rspec

backend-lint:
	docker compose exec backend bundle exec rubocop

backend-lint-fix:
	docker compose exec backend bundle exec rubocop -a

frontend-test:
	cd frontend && npm run test

frontend-lint:
	cd frontend && npm run lint

frontend-lint-fix:
	cd frontend && npm run lint:fix

db-migrate:
	docker compose exec backend rails db:migrate

db-seed:
	docker compose exec backend rails db:seed

db-reset:
	docker compose exec backend rails db:drop db:create db:migrate db:seed
