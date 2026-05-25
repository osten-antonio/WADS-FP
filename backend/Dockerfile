# TODO: ALL IMPORTS NEED TO HAVE .JS EXTENSION FOR SOME REASON

FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# for prisma temporarily
ARG DATABASE_URL=postgresql://dummy:dummy@localhost/dummy
ENV DATABASE_URL=$DATABASE_URL 
ARG BACKEND_HOSTNAME=localhost
ENV BACKEND_HOSTNAME=$BACKEND_HOSTNAME
RUN npx prisma generate

RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Allow runtime port configuration
ARG BACKEND_PORT=8000
ENV BACKEND_PORT=${BACKEND_PORT}
ARG BACKEND_HOSTNAME=localhost
ENV BACKEND_HOSTNAME=${BACKEND_HOSTNAME}
# Copy only what we need from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/generated ./generated

EXPOSE ${BACKEND_PORT}
CMD ["npm", "run", "start"]