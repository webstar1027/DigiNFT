# Base image for NodeJS application
FROM node:16.13.0

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Copy .env file
COPY .env.example ./.env

# Remove old stuff
RUN rm -rf dist/ &&\
    rm -rf node_modules/

# Install APP source
RUN npm install

# Expose APP port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start"]
