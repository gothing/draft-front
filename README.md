GODRAFT FRONT
-------------

## Docker image

Docker image can be used for local deployment.
To build the image execute in the repository root:

- DEV (development server):
```shell
$ docker build -t <image-tag> --target=dev .
```

- RELEASE (nginx server):
```shell
$ docker build -t <image-tag> --target=release .
```

When the image is build, execute:
```shell
$ docker run -d -p 8080:80 <image-tag>
```

Check if front is running:
```shell
$ curl http://127.0.0.1/
```
