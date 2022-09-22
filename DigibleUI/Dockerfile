# Base image for NodeJS application
FROM node:16.13.0

# Create app directory
WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . .

# Remove old stuff
RUN rm -rf dist/ &&\
    rm -rf node_modules/

# Install APP source
RUN npm install --legacy-peer-deps
RUN npm uninstall web3
RUN npm install web3@1.2.11
RUN npm run postinstall
#RUN npm audit fix
RUN npm run build -- --prod

# Expose APP port
EXPOSE 4200

# Start application
CMD "npm" "start"