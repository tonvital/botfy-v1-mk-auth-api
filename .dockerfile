FROM node:16-alpine 


WORKDIR /api

COPY . .

RUN npm install

EXPOSE 9657

CMD [ "npm", "run", "dev" ]