FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/frontend/package*.json ./packages/frontend/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY packages/frontend ./packages/frontend
COPY packages/shared ./packages/shared

RUN npm run build --workspace=@letscode/shared

WORKDIR /app/packages/frontend

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0"]
