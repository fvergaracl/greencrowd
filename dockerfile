FROM node:20-alpine AS base

RUN apk add --no-cache openssl musl-dev libc6-compat

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install 

COPY . .

RUN npx prisma generate --schema=./prisma/schema.prisma

# -------------------------------
# Development Environment
# -------------------------------
FROM base AS dev
RUN echo "<<<<<<<<<<<<<<<<<<< Building development image"

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

# -------------------------------
# Production Environment
# -------------------------------
FROM base AS prod
RUN echo ">>>>>>>>>>>>>>>>> Building production image"

RUN npm run build

RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]

# -------------------------------
# Default Environment
# -------------------------------
FROM prod AS default
