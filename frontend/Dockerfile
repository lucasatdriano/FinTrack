FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ts.config*.json ./
RUN npm install

COPY . ./ 
RUN npm run build


FROM node:20-alpine as production

WORKDIR /app

COPY package*.json ts.config*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start"]