# Stage 1: Build Vite React App
FROM node:20-alpine AS builder
 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
 # Stage 2: Serve it with Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
 
# Optional: Override Nginx default config to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
