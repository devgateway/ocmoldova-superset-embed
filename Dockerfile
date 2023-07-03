FROM node:16 AS dev
ENV NODE_ENV=development
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=node_modules,id=node_modules_superset_embed_dev npm install
EXPOSE 3000
CMD ["npm", "run", "--cache", "/var/cache/", "start"]


FROM node:16 as prod
ENV NODE_ENV=production
ARG REACT_APP_SUPERSET_URL
ENV REACT_APP_SUPERSET_URL=$REACT_APP_SUPERSET_URL
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=node_modules,id=node_modules_superset_embed_prod npm install --production && npm run build && npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build"]
