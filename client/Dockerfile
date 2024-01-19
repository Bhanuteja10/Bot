# build step
FROM node:18.17.0-alpine
WORKDIR /app
COPY package.json .
RUN npm install --force
COPY . .

EXPOSE 3001

CMD ["npm", "start"]