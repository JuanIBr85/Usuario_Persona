# Etapa 1: Build de la app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor para producción
FROM node:20-alpine

WORKDIR /app

# Instala "serve" para servir archivos estáticos
RUN npm install -g serve

# Copia el build desde la etapa anterior
COPY --from=builder /app/dist ./dist

EXPOSE 5173

# Comando para servir la app en producción
CMD ["serve", "-s", "dist", "-l", "5173"]