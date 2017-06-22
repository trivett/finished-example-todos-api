# set the base image, must be the first instruction in the file
FROM node:7-onbuild
# set our app root as an environment variable
ENV APP_HOME /app
# create the app root folder
RUN mkdir $APP_HOME
# add our package.json and install the dependencies
ADD package.json $APP_HOME
RUN npm install
# add the rest of our application files
ADD . $APP_HOME
# expose port 3000 so we can connect to our api
EXPOSE 3000
# set the default run command to start our app

CMD npm run start