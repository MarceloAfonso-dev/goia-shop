# Development Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies for better compatibility
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 3000 (React dev server default)
EXPOSE 3000

# Set environment variables for development
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=true
ENV BROWSER=none

# Start development server with hot reload
CMD ["npm", "start"]
