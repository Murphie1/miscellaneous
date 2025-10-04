# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm install

COPY . .
RUN npm run build


# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Only copy runtime deps
COPY . ./
RUN npm install --production

# Copy built code from builder stage
COPY --from=builder /app/dist ./dist
RUN npx prisma generate


EXPOSE 3000

CMD ["node", "dist/server.js"]
