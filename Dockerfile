FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .
RUN chown -R node:node /usr/src/app

EXPOSE 3001

CMD ["npm", "run" ,"start:dev"]