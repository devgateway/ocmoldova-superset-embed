FROM node:16 AS node
ENV NODE_ENV=development
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=node_modules,id=node_modules_superset_embed_dev npm install
EXPOSE 3000
CMD ["npm", "run", "--cache", "/var/cache/", "start"]