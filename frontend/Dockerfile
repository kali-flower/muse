# build React app
FROM node:16 AS build

WORKDIR /app

# copy package.json and package-lock.json
COPY package*.json ./

# I=install dependencies
RUN npm install

# copy application files
COPY . .

# build React app for production
RUN npm run build

# serve React app with Nginx
FROM nginx:alpine

# copy build folder
COPY --from=build /app/build /usr/share/nginx/html

# expose port
EXPOSE 80

# start Nginx server
CMD ["nginx", "-g", "daemon off;"]
