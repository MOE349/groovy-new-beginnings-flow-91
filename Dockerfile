# Stage 1: Build Vite React App
FROM node:20-alpine AS builder
 
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
 
