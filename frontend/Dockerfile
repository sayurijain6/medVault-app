# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# API URL passed as build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_URL

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code and build static assets
COPY . .
RUN npm run build

# Stage 2: Serve stage
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
