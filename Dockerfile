FROM node:onbuild

# Add our user and group first to make sure their IDs get assigned consistently
RUN groupadd -r app && useradd -r -g app app

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY process.yaml /usr/src/app/
RUN npm install -g strongloop
RUN npm install

# Bundle app source
COPY server /usr/src/app

EXPOSE 8080
CMD [ "npm", "start" ]
# CMD [ "pm2", "-i", "max", "--node-args=\"--harmony\"", "sever/index.js" ]
