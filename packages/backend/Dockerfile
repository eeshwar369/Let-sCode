FROM node:20-alpine

WORKDIR /app

# Install Docker CLI for container orchestration
RUN apk add --no-cache docker-cli

COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY packages/backend ./packages/backend
COPY packages/shared ./packages/shared

RUN npm run build --workspace=@letscode/shared
RUN npm run build --workspace=@letscode/backend

EXPOSE 3000 3001

CMD ["npm", "run", "start", "--workspace=@letscode/backend"]
