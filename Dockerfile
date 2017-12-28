FROM node:9

WORKDIR app/

ADD package.json ./

RUN npm install --silent

ADD . ./

EXPOSE 3000

CMD npm start

