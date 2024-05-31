# Building layer
FROM --platform=linux/amd64 node:20-alpine as development

WORKDIR /app

COPY tsconfig*.json ./
COPY package*.json ./

RUN npm ci

COPY src/ src/

RUN npm run build

FROM --platform=linux/amd64 node:20-alpine as production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=development /app/dist/ ./dist/

EXPOSE 8080
ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

CMD [ "node", "dist/main.js" ]