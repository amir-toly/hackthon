docker build -t hackathon-nodejs-app .
docker run -it --rm --name my-running-app hackathon-nodejs-app
docker tag c8ca0dfd63d8 asia.gcr.io/data-audio-175707/hackathon-nodejs-app
gcloud docker -- push asia.gcr.io/data-audio-175707/hackathon-nodejs-app
