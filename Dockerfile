# First stage: Build stage
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json .
RUN npm install

COPY . .
RUN npm run build

# Second stage: Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json .

# Set environment variables
ENV MOGODB_CONNECTION_STRING=mongodb+srv://kpaadarsh:dYpr9rAearIHYOvi@todo.zaxa2cs.mongodb.net/?retryWrites=true&w=majority
ENV JWT_SECRET_KEY=gjsdhfkjsfda498784cbi#$$KJFkjjsjka$@%^&*()

# Copy only the necessary artifacts from the build stage
COPY --from=build /usr/src/app/dist ./dist

# Assuming your application runs using Node.js, you might need to install production dependencies
RUN npm install 

# You can also include any other setup or configuration steps needed for your application to run in production

# Specify any command to start your application
CMD ["node", "dist/index.js"]
