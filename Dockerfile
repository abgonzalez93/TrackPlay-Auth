# Imagen base ligera
FROM node:current-slim

# Crea carpeta de trabajo
WORKDIR /app

# Copia sólo lo necesario para instalar dependencias
COPY trackplay-auth/package.json trackplay-auth/pnpm-lock.yaml .npmrc ./

# Copia dependencias locales (para resolver "file:../")
COPY trackplay-core /trackplay-core
COPY trackplay-runtime /trackplay-runtime

# Instala pnpm y dependencias del sistema
RUN npm install -g pnpm@latest && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/*

# Instala dependencias y limpia
RUN pnpm install --frozen-lockfile --silent && \
    pnpm store prune && \
    pnpm cache clean && \
    rm -rf ./trackplay-core ./trackplay-runtime && \
    rm -f .npmrc

# Copia configuraciones necesarias
COPY trackplay-auth/tsconfig.json ./tsconfig.json
COPY trackplay-auth/src ./src

# Comando de arranque en desarrollo
CMD ["pnpm", "run", "dev"]
