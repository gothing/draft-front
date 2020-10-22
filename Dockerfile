FROM node:latest as dev
WORKDIR /tmp
COPY ./package*.json ./
RUN npm install
COPY . .
CMD HOST=0.0.0.0 PORT=80 npm start
EXPOSE 80

FROM node:latest as builder
WORKDIR /tmp
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm build

FROM nginx:latest as release
COPY --from=builder /tmp/docs /var/www
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
