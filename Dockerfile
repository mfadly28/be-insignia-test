# Dockerfile
FROM node:18-slim

# create app directory
WORKDIR /usr/src/app

# install deps
COPY package*.json ./
RUN npm ci --only=production

# copy source
COPY . .

# expose port
EXPOSE 3000

# start app
CMD ["node", "server.js"]
