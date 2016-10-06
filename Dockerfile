FROM mhart/alpine-node:6.7.0

RUN mkdir -p /usr/src/cra-noise-map
WORKDIR /usr/src/cra-noise-map

RUN ls -l
COPY ./ /usr/src/cra-noise-map
RUN rm Dockerfile
RUN ls -l

RUN npm install --production

EXPOSE 8080
CMD [ "npm", "start" ]