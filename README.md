<div align="center">

# 🛒 Instashop
### 🚀 Enterprise-Grade E-Commerce Microservices Platform

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-3-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)](https://rabbitmq.com/)

**Instashop** is a production-ready, cloud-native e-commerce platform demonstrating the full power of modern architecture. It elegantly combines **Domain-Driven Design (DDD)**, **CQRS**, **Event-Driven Communication**, and a **Hybrid Architecture** strategy — pairing robust backend microservices with a lightning-fast **React** frontend.

[Overview](#-project-overview) · [Features](#-key-features--modules) · [Architecture](#-architecture-highlights) · [Endpoints](#-api-endpoints-summary) · [Getting Started](#-getting-started)

<br/>

![Admin Dashboard UI Placeholder](./frontend-react/public/vite.svg)
*(Placeholder: Add your React Frontend UI screenshots here)*

</div>

---

## 🌟 Project Overview

Instashop is built as a complete reference architecture for developers looking to understand how to build, scale, and maintain enterprise software in **.NET 10**. Rather than forcing a single architectural pattern, the solution uses the **right tool for the right job**. Complex domains use strict Clean Architecture, while simple CRUD services are streamlined with Vertical Slice Architecture.

> [!NOTE]  
> **Development Goal:** Provide a clean, robust, and highly scalable microservices template equipped with real-world complexities like eventual consistency, JWT authentication, and distributed caching.

---

## ✨ Key Features & Modules

- **🛍️ Catalog Service (`Catalog.API`)**: Manages product inventory and categories using PostgreSQL (Marten Doc Store) and Vertical Slice Architecture.
- **🛒 Basket Service (`Basket.API`)**: Blazing-fast shopping cart management. Integrates with **Redis** using the Decorator Pattern to boost caching performance, and communicates with Discount via **gRPC**.
- **📦 Ordering Service (`Ordering.API`)**: The heart of the business logic. Implements strict **Domain-Driven Design (DDD)** and **Clean Architecture**. Handles rich aggregates, domain events, and complex order lifecycles. Includes the **Admin Orders Dashboard** endpoints.
- **🏷️ Discount Service (`Discount.Grpc`)**: High-performance **gRPC** microservice handling coupon validation and discount calculations on the fly.
- **🔐 Identity Service (`Identity.API`)**: Centralized auth provider. Issues RSA-signed JWT tokens and manages users/roles via ASP.NET Core Identity.
- **🔀 API Gateway (`YarpApiGateway`)**: Powered by **YARP (Yet Another Reverse Proxy)**. Handles centralized routing, rate limiting, and global CORS configurations.
- **⚛️ Frontend UI (`frontend-react`)**: A sleek, dark-themed React 19 SPA built with Vite. Features a dynamic checkout flow, infinite CSS marquees, and a fully functional Admin Orders Dashboard.

---

## 🏗️ Architecture Highlights

The Instashop platform leverages a **Hybrid Architectural Strategy** designed to scale with complexity. We use the right pattern for the right bounded context, ensuring high performance and developer velocity.

### 🌊 Request Execution Flow

Below is the standard execution path for an incoming API request demonstrating how data flows from the client, through the application layers, into the domain, and finally to persistence and messaging.

```mermaid
graph TD
    %% Define Nodes
    Client["💻 React Frontend\n(Axios / Fetch)"]
    Gateway["🔀 YARP API Gateway\n(Routing & CORS)"]
    API["🌐 Carter Endpoint\n(Minimal API)"]
    Val["🛡️ FluentValidation\n(Explicit Validation)"]
    MediatR["⚙️ MediatR\n(CQRS Command/Query)"]
    Handler["🛠️ Application Handler\n(Business Logic)"]
    Domain["🧩 Domain Entities\n(Aggregates / Rules)"]
    DB["🗄️ EF Core / Marten\n(Persistence)"]
    MQ["📨 MassTransit\n(RabbitMQ)"]

    %% Connect Flow
    Client -->|"1. HTTP Request"| Gateway
    Gateway -->|"2. Proxy Request"| API
    API -->|"3. Validate Request"| Val
    Val -->|"4. Send(Command)"| MediatR
    MediatR -->|"5. Dispatch"| Handler
    Handler -->|"6. Mutate State"| Domain
    Domain -.->|"7. Trigger Domain Events"| Handler
    Handler -->|"8. SaveChangesAsync"| DB
    Handler -->|"9. Publish Integration Event"| MQ
    DB -->|"10. Return Result"| Handler
    Handler -->|"11. Return DTO"| API
    API -->|"12. HTTP 200/201"| Client

    %% Styling
    classDef client fill:#005A9C,stroke:#61DAFB,color:#fff,font-weight:bold
    classDef gateway fill:#1A365D,stroke:#63B3ED,color:#fff
    classDef api fill:#1C4532,stroke:#48BB78,color:#fff
    classDef logic fill:#2C7A7B,stroke:#38B2AC,color:#fff
    classDef domain fill:#6B46C1,stroke:#9F7AEA,color:#fff
    classDef infra fill:#2D3748,stroke:#718096,color:#CBD5E0
    classDef mq fill:#652B19,stroke:#FC8181,color:#fff

    class Client client
    class Gateway gateway
    class API,Val api
    class MediatR,Handler logic
    class Domain domain
    class DB infra
    class MQ mq
```

#### ASCII Flow Representation
```text
[React Client] 
   │ (HTTP POST /api/orders)
   ▼
[YARP Gateway] ──(Proxies)──► [Carter Minimal API]
                                 │
                                 ├─► Explicit FluentValidation (Throws on invalid)
                                 │
                                 ▼
                              [MediatR] ──(Dispatches)──► [Command Handler]
                                                               │
                                                               ├─► Loads/Creates [Domain Aggregate Root]
                                                               ├─► Enforces [Business Invariants]
                                                               ├─► Invokes EF Core [DbContext.SaveChangesAsync()]
                                                               │
                                                               ▼
[RabbitMQ / MassTransit] ◄──(Publishes Integration Event)── [Application Layer]
```

---

### 🧩 Core Architectural Patterns

| Pattern | Description | Application Context |
| :--- | :--- | :--- |
| ![Vertical Slice](https://img.shields.io/badge/Pattern-Vertical_Slice-10B981?style=flat-square) | Feature-centric organization. Everything needed for a single request (Endpoint, Handler, Validator) lives in one folder. | `Catalog.API`, `Basket.API` |
| ![Clean Architecture](https://img.shields.io/badge/Pattern-Clean_Architecture-3B82F6?style=flat-square) | Strict separation of concerns (Domain, Application, Infrastructure, Presentation) protecting core logic. | `Ordering.API` |
| ![CQRS](https://img.shields.io/badge/Pattern-CQRS-8B5CF6?style=flat-square) | Segregates Read paths (Queries) from Write paths (Commands) using **MediatR**. | All Microservices |
| ![Event Driven](https://img.shields.io/badge/Pattern-Event_Driven-F59E0B?style=flat-square) | Asynchronous messaging via RabbitMQ for decoupled cross-service synchronization. | `Basket`, `Ordering` |

---

### 🛡️ Layer Breakdown & Responsibilities

#### 1. Domain Layer (`OrderingDomain`)
The core of the application containing the business rules, isolated from all external dependencies.
- **Entities & Aggregate Roots:** Rich objects (e.g., `Order`, `OrderItem`) that protect their invariants. State is mutated strictly through methods, never direct property setters.
- **Value Objects:** Immutable types (e.g., `Address`, `Payment`) ensuring equality by value.
- **Enums:** Strongly-typed business statuses (e.g., `OrderStatus`).
- **Domain Events:** Triggers (e.g., `OrderCreatedEvent`) dispatched internally upon state changes to maintain consistency across the aggregate.

#### 2. Application Layer (`Ordering.Application`)
Orchestrates business use cases without containing business rules itself.
- **Explicit Validation:** We utilize **FluentValidation** explicitly inside the Handlers or Minimal APIs (bypassing auto-behaviors) for precise, controlled validation responses.
- **MediatR Dispatching:** Endpoints send lightweight `Commands` or `Queries` into MediatR, which locates and executes the corresponding Handler.
- **DTO Projection:** Domain entities are mapped directly to Data Transfer Objects (DTOs) before returning to the presentation layer.

#### 3. Infrastructure Layer (`Ordering.Infrastructure`)
Handles all external I/O, persistence, and external service communication.
- **Persistence (EF Core / Marten):** Implements DB contexts, Interceptors (like `DispatchDomainEventInterceptor`), and configurations.
- **Event Bus:** Configures **MassTransit** over **RabbitMQ**.

#### 4. Presentation / API Layer (`Endpoints`)
- **Carter & Minimal APIs:** We use Carter modules to map extremely thin, performant Minimal API endpoints. These endpoints contain zero business logic—they simply parse the HTTP request, send it to MediatR, and return the HTTP response.

> [!TIP]
> **Event-Driven Highlight:** When a user checks out, `Basket.API` publishes a `BasketCheckoutEvent` to RabbitMQ and clears the Redis cache. The `Ordering.API` asynchronously consumes this event via an Integration Event Handler, creating the definitive Order entity in PostgreSQL without any synchronous blocking!

---

## 📡 API Endpoints Summary

Below is a snapshot of the core endpoints exposed through the **YARP Gateway** (`localhost:5000`):

| Service | Method | Endpoint | Description | Auth Required |
|---------|--------|----------|-------------|---------------|
| **Catalog** | `GET` | `/products` | Retrieve paginated products | ❌ |
| **Catalog** | `POST` | `/products` | Create a new product | ✅ Admin |
| **Basket** | `GET` | `/basket/{username}` | Get user shopping cart | ✅ User |
| **Basket** | `POST` | `/basket/checkout` | Trigger checkout event | ✅ User |
| **Ordering**| `GET` | `/orders` | Retrieve paginated orders | ✅ Admin |
| **Ordering**| `POST` | `/order/status` | Update order status (Enum) | ✅ Admin |
| **Identity**| `POST` | `/auth/login` | Authenticate and retrieve JWT | ❌ |
| **Identity**| `POST` | `/auth/register` | Register a new user | ❌ |

---

## ⚙️ Environment Variables

The backend services rely on the following key environment variables configured in `docker-compose.yml`:

```env
# Global Settings
ASPNETCORE_ENVIRONMENT=Docker

# Database Connections (PostgreSQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=InstashopDb

# Message Broker (RabbitMQ)
RABBITMQ_DEFAULT_USER=guest
RABBITMQ_DEFAULT_PASS=guest
MessageBroker__Host=amqp://rabbitmq:5672

# Redis Cache
ConnectionStrings__Redis=redis-cache:6379
```

> [!TIP]
> The solution uses `init-dbs.sql` to automatically seed the necessary PostgreSQL databases upon first launch.

---

## 🚀 Getting Started

### Prerequisites
- **Docker Desktop** (v4.x+)
- **.NET 10 SDK**
- **Node.js** (v18+)

### 1️⃣ Spin up the Infrastructure
From the repository root, start all microservices, databases, and the API gateway:
```bash
docker compose up -d
```
*Wait ~30 seconds for RabbitMQ and PostgreSQL to become fully healthy.*

### 2️⃣ Start the React Frontend
Open a new terminal, navigate to the frontend directory, install dependencies, and run the development server:
```bash
cd frontend-react
npm install
npm run dev
```
The web app will now be running at **http://localhost:5173**. It automatically proxies API requests to the YARP Gateway (`http://localhost:5000`).

### 3️⃣ Database Migrations (Local Dev Only)
If you modify the **Ordering** or **Identity** EF Core models, generate and apply migrations:
```bash
dotnet ef migrations add <MigrationName> --project Services/Ordering/Ordering.Infrastructure --startup-project Services/Ordering/Ordering.API
docker compose up -d --build ordering.api
```

---

## 📄 License
This project is licensed under the MIT License. Feel free to use it as a robust template for your own enterprise microservice architectures.
