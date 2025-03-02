#!/bin/bash
imageName=crm-service-staging
containerName=crm-service-staging

sudo docker build -t $imageName  . -f ./staging.Dockerfile

echo Delete old container...
sudo docker rm -f $containerName

echo Run new container...
sudo docker run -d -p 6529:1337 --name $containerName --restart unless-stopped $imageName

# docker-compose up -d --scale transaction-credit-service=1
