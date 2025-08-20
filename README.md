#Orders MicroService

## Development pasos

1. Clonar el proyecto
2. Crear archivo `.env` basado en el archvivo `.env.template`
3. Levantar la base de datos con `docker-compose up -d`
4. Levantar el servidor de Nats

```
docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats
```

5. Levantar el proyecto con `npm run start:dev`
