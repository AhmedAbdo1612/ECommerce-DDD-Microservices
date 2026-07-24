# Instashop Architecture & Port Mappings

When running the Instashop backend using Docker Compose, the services are exposed to your local host machine on specific ports. This allows the React application (running natively on your host machine via Vite) to access the backend services via `localhost`.

## Microservices Ports (Internal & External)

| Service Name | Internal Container Port | Exposed Host Port (`localhost`) | Description |
| :--- | :---: | :---: | :--- |
| **YarpApiGateway** | 8080 | **5000** | The primary entry point. The React app connects here. |
| **Catalog.API** | 8080 | 6000 | Product and category management. |
| **Basket.API** | 8080 | 6001 | User shopping cart and Redis caching. |
| **Discount.Grpc** | 8080 | 6002 | High-performance gRPC coupon management. |
| **Ordering.API** | 8080 | 6003 | Order placement and CQRS infrastructure. |
| **Identity.API** | 8080 | 6004 | Authentication and JWT token issuance. |
| **Media.API** | 8080 | 6005 | Image uploads and static file serving. |

## Infrastructure Services

| Service Name | Exposed Host Port (`localhost`) | Description |
| :--- | :---: | :--- |
| **PostgreSQL** | 5433 | Relational database (mapped to 5432 internally). |
| **Redis** | 6379 | Distributed caching for basket. |
| **RabbitMQ** | 5672 (AMQP) / 15672 (UI) | Message broker and management UI. |

## React Frontend Configuration
The React application runs natively outside Docker and connects to the **YarpApiGateway** (Port 5000).

- **API Base URL**: Configured in `.env` as `VITE_API_URL=http://localhost:5000`.
- **CORS**: The API Gateway is configured with an `AllowAll` CORS policy to permit requests from the Vite development server (usually running on port `5173`).
- **Media URLs**: Uploaded media returned by `Media.API` natively points to `http://localhost:5000/images/` allowing direct rendering through the gateway proxy.
