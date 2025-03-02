#!/bin/bash
imageName=crm-service-production
containerName=crm-service-production
# containerReplica=crm-service-production-1

sudo docker build -t $imageName  . -f ./production.Dockerfile

echo Delete old container...
sudo docker rm -f $containerName

echo Run new container...
sudo docker run -d -p 6536:1337 --name $containerName --restart unless-stopped $imageName
# sudo docker rm -f $containerReplica
# sudo docker run -d -p 3005:1337 --name $containerReplica --restart unless-stopped $imageName



# docker-compose up -d --scale transaction-credit-servicer=1
