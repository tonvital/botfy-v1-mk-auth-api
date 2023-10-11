FROM node:16-alpine 


WORKDIR /api

COPY . .

RUN npm install

ENV PORT=9657
ENV IS_DOCKER=1
ENV DATABASE_IP=localhost
ENV DATABASE_PASSWORD=4VcdaV9o5u5@

EXPOSE 9657

CMD [ "npm", "run", "dev" ]