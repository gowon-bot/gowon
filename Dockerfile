FROM node:16

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# The square brackets ensure the files will only be copied if they exist
# (those files are used for development so that it can be run outside of docker)
# Source: https://stackoverflow.com/questions/31528384/conditional-copy-add-in-dockerfile
COPY ./docker.ormconfig.json* ./ormconfig.json
COPY ./docker.config.json* ./config.json

RUN npm run build

EXPOSE 3000
CMD ["node", "dist/src/index.js"]