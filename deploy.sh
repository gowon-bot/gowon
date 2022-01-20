#! /bin/bash

docker build . -t jivison/gowon
docker run -p 3000:3000 -d jivison/gowon