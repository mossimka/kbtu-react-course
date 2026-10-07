FROM node:20

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
    && pnpm config set minimumReleaseAge 0 \
    && pnpm install --frozen-lockfile

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0"]