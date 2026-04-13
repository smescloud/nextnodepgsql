FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY prisma ./prisma

RUN npx prisma generate

COPY index.js ./

EXPOSE 4000

CMD ["npm", "run", "start:docker"]
