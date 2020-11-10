FROM node:latest as base
WORKDIR /tmp
COPY ./package*.json ./
RUN npm install
COPY . .

FROM base as dev
CMD HOST=0.0.0.0 PORT=80 npm run-script start
EXPOSE 80

FROM base as builder
RUN npm run-script build

FROM nginx:latest as release
COPY --from=builder /tmp/docs /var/www
COPY ./docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
