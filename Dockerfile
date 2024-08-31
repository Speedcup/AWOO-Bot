# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Install TypeScript globally (optional, if you want it globally available)
RUN npm install -g typescript

# Copy the rest of the application files
COPY . .

# Compile TypeScript to JavaScript
RUN npm run build

# Expose any necessary ports (if needed, for a web server or other purposes)
# EXPOSE 3000

# Command to run your bot
CMD ["sh", "-c", "tsc && node dist/index.js"]