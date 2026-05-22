FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# for prisma temporarily
ARG DATABASE_URL=postgresql://dummy:dummy@localhost/dummy
ENV DATABASE_URL=$DATABASE_URL 
RUN npx prisma generate

RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy only what we need from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/generated ./generated

EXPOSE 8000
CMD ["node", "dist/index.js"]
