# specify the node base image with your desired version node:<version>
FROM node:6
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD npm start 
EXPOSE 3000
