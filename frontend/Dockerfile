FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy SSL certificates
COPY cert.pem /etc/nginx/certs/cert.pem
COPY key.pem  /etc/nginx/certs/key.pem

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
