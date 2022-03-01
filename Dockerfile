FROM node:16

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY yarn.lock ./
RUN yarn

# Copy source
COPY . .


RUN yarn rebuild

EXPOSE 3000
CMD ["node", "dist/src/index.js"]