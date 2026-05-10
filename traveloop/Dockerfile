FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# Remove the server folder from the frontend build context to avoid issues
RUN rm -rf server
RUN npm run build

FROM nginx:alpine
# Copy the built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Add a custom nginx config if necessary for client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
