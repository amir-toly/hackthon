docker build -t hackathon-nodejs-app .
docker tag hackathon-nodejs-app asia.gcr.io/data-audio-175707/hackathon-nodejs-app
gcloud docker -- push asia.gcr.io/data-audio-175707/hackathon-nodejs-app
