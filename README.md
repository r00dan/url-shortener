# tinyurl clone

## Environment Variables

### Database Configuration
- `POSTGRES_HOST`: Host address for PostgreSQL access.
- `POSTGRES_PORT`: Port number for PostgreSQL access.
- `POSTGRES_USER`: Username for the database.
- `POSTGRES_PASSWORD`: Password for the specified user.
- `POSTGRES_DB`: Name of the database to use.
- `REDIS_HOST`: Host address for Redis access.
- `REDIS_PORT`: Port number for Redis access.

### Queue Configuration
- `NATS_HOST`: Host address for NATS access.
- `NATS_PORT`: Port number for NATS access.

### Application Configuration
- `API_PORT`: Port number the app is running on.
- `WORKER_PORT`: Port number the worker is running on.

You can set these variables in a `.env` file located in the project root directory.

## Getting Started

Follow these steps to build and run the project:

1. **Create a Docker network**:
```bash
$ docker network create -d bridge shortener-network
```

2. **Build the container**:
```bash
$ docker compose build --no-cache
```

3. **Start the container**:
```bash
$ docker compose up -d
```

## Done Optimizations and Possible Improvements

To improve write performance and protect against data loss, we are using queues, specifically NATS in our case.

To enhance read performance, I have integrated Redis for caching.

As for potential improvements, I see the following:
- Split the database into a master/slave configuration.
- Perform writes to the master database.
- Read from multiple slave databases for improved read scalability and performance.