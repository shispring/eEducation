# Whiteboard Service

## Deployment

1. Build docker image

```bash
# build this project to a docker image: whiteboard
docker build -t whiteboard .
```

2. Run an instance

```bash
# start an instance with your token and serve at port 8080
docker run -d --name=whiteinstance2 -e WHITE_TOKEN="<your token>" -p 8080:8080 whiteboard
```

3. Have a try

```bash
# create a whiteboard room with name: haha
 curl -v -X POST \
  http://127.0.0.1:8080/v1/room/create \
  -H 'content-type: application/json' \
  -d '{ "name": "haha" }'
```