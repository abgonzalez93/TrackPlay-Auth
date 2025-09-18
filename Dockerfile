# Imagen base ligera
FROM node:24.0-slim

# Crea carpeta de trabajo
WORKDIR /app

# Copia sólo lo necesario para instalar dependencias
COPY package.json pnpm-lock.yaml .npmrc* ./

# Instala pnpm + dependencias del sistema
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    pnpm install --frozen-lockfile --silent && \
    pnpm cache clean && \
    rm -f .npmrc && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copia configuraciones necesarias
COPY tsconfig.json ./
COPY src ./src

# Comando de arranque en desarrollo
CMD ["pnpm", "run", "dev"]
