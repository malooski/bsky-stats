# The instructions for the first stage
FROM node

WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json ./ 
RUN npm install

COPY --chown=node:node . .

RUN npm run build:server

EXPOSE 3001

CMD ["npm", "run", "start:server"]
