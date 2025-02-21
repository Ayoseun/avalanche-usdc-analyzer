# Use official Node.js image as base
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and lock file first (to leverage Docker cache)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Copy environment file based on build argument
ARG ENV=development
RUN cp src/config/env/${ENV}.env .env

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env .env

# Set environment variable for Next.js
ENV NODE_ENV=development

# Expose port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
