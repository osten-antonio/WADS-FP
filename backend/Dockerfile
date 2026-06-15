FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG DATABASE_URL=postgresql://dummy:dummy@localhost/dummy
ENV DATABASE_URL=$DATABASE_URL
ARG BACKEND_HOSTNAME=localhost
ENV BACKEND_HOSTNAME=$BACKEND_HOSTNAME
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ARG BACKEND_PORT=8000
ENV BACKEND_PORT=${BACKEND_PORT}
ARG BACKEND_HOSTNAME=localhost
ENV BACKEND_HOSTNAME=${BACKEND_HOSTNAME}

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev                       
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated   
COPY --from=builder /app/prisma ./prisma         

EXPOSE ${BACKEND_PORT}
CMD ["npm", "run", "start"]