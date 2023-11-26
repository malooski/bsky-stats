# The instructions for the first stage
FROM node

WORKDIR /app


RUN chown -R node:node /app

USER node

COPY --chown=node:node package*.json ./ 
RUN npm install

COPY --chown=node:node . .

ARG BACKEND_URL
RUN npm run build:webapp

EXPOSE 8080

CMD ["npm", "run", "serve:webapp"]
