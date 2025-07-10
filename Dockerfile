# Stage 1: Build Vite React App
FROM node:20-alpine AS builder
 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built app and ensure all static assets are included
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure proper permissions for static files
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
