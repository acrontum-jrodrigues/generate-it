# Generate-It
[![Dependencies](https://david-dm.org/acrontum/generate-it.svg)](https://david-dm.org/acrontum/generate-it) | [![Build Status](https://travis-ci.org/acrontum/generate-it.svg?branch=master)](https://travis-ci.org/acrontum/generate-it) | [codecov](https://codecov.io/gh/acrontum/generate-it/)

Generate-It is a tool to generate RESTful servers/clients without Java.

Generate-It is a tool to generate Event Handle layer for servers/clients without Java, eg RabbitMQ.

Change your APIs yml and simply (re)Generate-It, your business logic is safe and sound.. but the http/channel layer is regenerated in seconds.

Here is an example: generate-it is parsing an **OpenAPI** file using a [typescript sever tpl git repo](https://github.com/acrontum/openapi-nodegen-typescript-server):
```
generate-it openapi.yml --template https://github.com/acrontum/openapi-nodegen-typescript-server.git
```

Here is an example: generate-it is parsing an **AsyncAPI** file using a [typescript RabbitMQ tpl git repo](https://github.com/acrontum/generate-it-asyncapi-rabbitmq) which is designed to work with the TypeScript server:
```
generate-it asyncapi.yml --template https://github.com/acrontum/generate-it-asyncapi-rabbitmq.git
```
___

Full **[DOCUMENTATION](https://acrontum.github.io/generate-it/)** hosted on github pages..

___

The client/server will be generated using the [Nunjucks Template](https://www.npmjs.com/package/nunjucks) engine.

The templates should be hosted on a publicly available https url, eg: [openapi-nodegen-typescript-server](https://github.com/acrontum/openapi-nodegen-typescript-server#setup). 

It is strongly recommended to use the OpenApi DSL package [boats](https://www.npmjs.com/package/boats) to standardize OpenAPI/AsyncAPI file architecture and operation IDs and more.
___

Generate-It is an opensourced project from [acrontum](https://www.acrontum.de/) written in TypeScript and is tested on NodeJS 12 LTS. 
