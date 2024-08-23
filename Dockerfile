FROM node:16

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
COPY yarn.lock* ./
RUN yarn

# Copy source
COPY . .

# This line is broken, so... just remove it!
RUN sed -i '/var global = globalSelf || phxWindow || global;/d' node_modules/phoenix/priv/static/phoenix.cjs.js

RUN yarn rebuild

EXPOSE 3000
CMD ["node", "dist/src/index.js"]