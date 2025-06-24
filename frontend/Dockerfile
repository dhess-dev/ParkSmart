FROM node:18-alpine as build

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

# Copy certs into nginx paths
COPY cert.pem /etc/ssl/certs/cert.pem
COPY key.pem  /etc/ssl/private/key.pem
COPY nginx.conf /etc/nginx/nginx.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
