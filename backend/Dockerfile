# ============================================
# Stage: development
# ============================================
FROM ruby:3.3-slim AS development

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    libpq-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock* ./
RUN bundle install --jobs 4 --retry 3

COPY . .

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]

# ============================================
# Stage: production
# ============================================
FROM ruby:3.3-slim AS production

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd --system deploy && \
    useradd --system --gid deploy --create-home deploy

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install --without development test --jobs 4 --retry 3 && \
    rm -rf ~/.bundle/cache

COPY . .

RUN chown -R deploy:deploy /app

USER deploy

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/up || exit 1

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]
