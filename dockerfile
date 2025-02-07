FROM node:20-alpine AS base

RUN apk add --no-cache openssl musl-dev libc6-compat

WORKDIR /usr/src/app

COPY . .

RUN npx prisma generate --schema=./prisma/schema.prisma

ARG GIT_COMMIT_HASH
ENV NEXT_PUBLIC_GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

RUN echo "Building with NEXT_PUBLIC_GIT_COMMIT_HASH=${NEXT_PUBLIC_GIT_COMMIT_HASH}"

# -------------------------------
# Development Environment
# -------------------------------
FROM base AS dev
RUN echo "<<<<<<<<<<<<<<<<<<< Building development image"

EXPOSE 3000

CMD ["npm", "run", "dev"]

# -------------------------------
# Production Environment
# -------------------------------
FROM base AS prod
RUN echo ">>>>>>>>>>>>>>>>> Building production image"

RUN npm run build

EXPOSE 3000
RUN echo ">>>>>>>>>>>>>>>>> Building production image [FINISHED]"

COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
