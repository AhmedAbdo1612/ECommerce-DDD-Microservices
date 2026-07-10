# 🛒 Instashop E-Commerce Microservices

![Instashop Banner](./assets/instashop_banner.jpg)

**Instashop** is a state-of-the-art e-commerce microservices platform built using **.NET 10**. This system leverages industry-standard design patterns to achieve high scalability, domain isolation, and optimized performance. The codebase demonstrates a **hybrid architectural approach**—combining **Vertical Slice Architecture** for feature-heavy services and **Clean Architecture (DDD)** for complex enterprise ordering workflows.

---

## 🏗️ Architectural Topology

The following component diagram illustrates how clients interact with the API gateways, how services communicate via RPC (gRPC), and how data stores (Marten Document DB, PostgreSQL Relational, SQLite, Redis Cache) are organized:

```mermaid
graph TB
    %% Clients
    Client([🌐 Client App / API Client])

    subgraph "Service Mesh (Docker Compose)"
        %% API Endpoints
        CatalogAPI["🛍️ Catalog.API <br> (Vertical Slice, Marten)"]
        BasketAPI["🛒 Basket.API <br> (Vertical Slice, Redis + Marten)"]
        OrderingAPI["📦 Ordering.API <br> (Clean Architecture Controllers)"]
        DiscountGrpc["🏷️ Discount.Grpc <br> (High-Perf gRPC, EF SQLite)"]
        
        %% Shared Abstraction
        BuildingBlocks["🧩 BuildingBlocks <br> (Shared CQRS & Pipeline)"]
    end

    %% Databases & Cache
    subgraph "Databases & Caching"
        MartenPostgres[("🐘 Postgres <br> (Marten Doc Store)")]
        RedisCache[("🔴 Redis Cache <br> (Basket Caching)")]
        SQLiteDb[("💾 SQLite <br> (DiscountDb.db)")]
        EFPostgres[("🐘 Postgres <br> (Ordering Relational Db)")]
    end

    %% Flow Relations
    Client -->|REST HTTP / Carter| CatalogAPI
    Client -->|REST HTTP / Carter| BasketAPI
    Client -->|REST HTTP / Controllers| OrderingAPI
    
    BasketAPI -->|gRPC Call| DiscountGrpc
    DiscountGrpc -->|EF Core SQLite| SQLiteDb
    
    CatalogAPI -->|Marten Session| MartenPostgres
    BasketAPI -->|Decorator Pattern| RedisCache
    RedisCache -.->|Fallback to Marten| MartenPostgres
    OrderingAPI -->|EF Core Postgres| EFPostgres
    
    %% Dependency Injection of Shared Core
    CatalogAPI -.-> BuildingBlocks
    BasketAPI -.-> BuildingBlocks
    OrderingAPI -.-> BuildingBlocks

    %% Styling
    classDef api fill:#1A365D,stroke:#3182CE,stroke-width:2px,color:#fff;
    classDef db fill:#2D3748,stroke:#4A5568,stroke-width:2px,color:#fff;
    classDef grpc fill:#2C7A7B,stroke:#319795,stroke-width:2px,color:#fff;
    classDef shared fill:#742A2A,stroke:#9B2C2C,stroke-width:2px,color:#fff;
    
    class CatalogAPI,BasketAPI,OrderingAPI api;
    class MartenPostgres,RedisCache,SQLiteDb,EFPostgres db;
    class DiscountGrpc grpc;
    class BuildingBlocks shared;
```

---

## 🛠️ Tech Stack & Service Matrix

| Service | Architecture | Primary Technology | Database / Datastore | Key Pattern / Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`Catalog.API`** | Vertical Slice | .NET 10 Minimal APIs (Carter) | Marten (PostgreSQL Doc Store) | Inventory, catalog pagination |
| **`Baket.API`** | Vertical Slice | .NET 10 Minimal APIs (Carter) | Redis Cache + Marten (PostgreSQL) | Shopping Cart, Caching Decorator |
| **`Discount.Grpc`** | RPC Service | gRPC Server | EF Core + SQLite | High-speed discount coupon lookup |
| **`Ordering`** | Clean Architecture | ASP.NET Core Controllers | EF Core + PostgreSQL | Enterprise DDD, Domain Events, Orders |
| **`BuildingBlocks`** | Shared Core | Library Abstractions | N/A | Cross-cutting concerns, CQRS behaviors |

---

## ⚡ Execution Flow & Request Pipeline

Each service processes incoming requests through a unified pipeline behavior structure defined in `BuildingBlocks`. This flowchart shows how requests are logged, validated, and mapped as they navigate through the application:

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Endpoint as API Endpoint (Carter/Controller)
    participant Mapster as Mapster Mapper
    participant MediatR as MediatR Pipeline
    participant Behaviors as Pipeline Behaviors (Logging & Validation)
    participant Handler as Command/Query Handler
    participant DB as Datastore (Marten/EF/Redis)

    Client->>Endpoint: HTTP Request (e.g. POST /products)
    Endpoint->>Mapster: Map Request DTO to Command/Query
    Mapster-->>Endpoint: Command/Query Object
    Endpoint->>MediatR: Send(Command/Query)
    
    activate MediatR
    MediatR->>Behaviors: LoggingBehavior (Start timer & log request)
    activate Behaviors
    Behaviors->>Behaviors: ValidationBehavior (Runs FluentValidation)
    
    alt Validation Fails
        Behaviors-->>Client: Throw ValidationException (400 Bad Request)
    else Validation Succeeds
        Behaviors->>Handler: Handle(Command/Query)
        activate Handler
        Handler->>DB: Perform Read/Write Operations
        DB-->>Handler: Return Entity/Data
        Handler-->>Behaviors: Return Command/Query Result
        deactivate Handler
    end
    
    Behaviors->>Behaviors: LoggingBehavior (Log execution time & finish)
    Behaviors-->>MediatR: Return Result
    deactivate Behaviors
    
    MediatR-->>Endpoint: Return Result Object
    deactivate MediatR
    
    Endpoint->>Mapster: Map Result to Response DTO
    Mapster-->>Endpoint: Response DTO
    Endpoint-->>Client: HTTP Response (200 OK / 201 Created)
```

---

## 🛍️ Detailed Service Breakdown

### 1. Catalog Service (`Catalog.API`)
Manages the inventory of products. Written using the **Vertical Slice Architecture**, keeping endpoints, MediatR command/query, handlers, and validation rules in feature-specific directories.
* **Storage:** PostgreSQL managed via **Marten** (which exposes PostgreSQL as a high-performance JSON document database).
* **Key Endpoints:** Create Product, Update Product, Delete Product, Get Products (with cursor/offset pagination), Get Product by Category.

### 2. Basket Service (`Baket.API`)
Manages user shopping carts and communicates with the `Discount.Grpc` service to apply coupon codes dynamically.
* **Marten & Redis Caching:** Employs the **Decorator Pattern**. The main database operations are defined in `BasketRepository`, which is wrapped inside a `CachedBasketRepository` that utilizes a Redis distributed cache.
* **Flow Diagram of Caching Strategy:**
```mermaid
graph TD
    Request([📥 Basket Request]) --> CacheCheck{Check Redis Cache}
    CacheCheck -->|Cache Hit| ReturnCache[Return Basket Data]
    CacheCheck -->|Cache Miss| FetchDb[Fetch from Marten Postgres]
    FetchDb --> UpdateCache[Write Basket to Redis Cache]
    UpdateCache --> ReturnDb[Return Basket Data]
    
    style CacheCheck fill:#2D3748,stroke:#3182CE,stroke-width:2px,color:#fff;
```

### 3. Discount Service (`Discount.Grpc`)
A high-performance gRPC microservice that stores and manages coupon details.
* **Storage:** EF Core mapping to a local SQLite database (`DiscountDb.db`).
* **Protocol Buffers:** Interface defined in [discount.proto](file:///E:/C%23-courses/Microservices_DDD_CQRS_VerticalClean_Architecture_2024/Instashop/Instashop/Services/Discount/Discount.Grpc/Protos/discount.proto) supplying `GetDiscount`, `CreateDiscount`, `UpdateDiscount`, and `DeleteDiscount` RPCs.

### 4. Ordering Service (`Ordering`)
The system's most complex service, implemented using **Clean Architecture** and strict **Domain-Driven Design (DDD)**.
* **Core Domains & Aggregates:** Models customer records, products, order lines, billing/shipping addresses, and payment details.
* **Layer Isolation:**
  * **`OrderingDomain`**: Houses pure business logic, invariants, value objects, domain exceptions, and domain events.
  * **`Ordering.Application`**: Declares CQRS Commands/Queries, MediatR handlers, and database abstractions (`IApplicationDbContext`).
  * **`Ordering.Infrastructure`**: Handles EF Core mapping configurations, custom database migrators, database seed extension, and save changes interceptors (`AuditableEntityInterceptor` and `DispatchDomainEventInterceptor`).
  * **`Ordering.API`**: Exposes standard controllers forwarding payloads to the Application core.

---

## 🧩 Shared Abstractions (`BuildingBlocks`)

The common library provides a solid foundation for cross-cutting concerns:
* **CQRS Core:** Interfaces `ICommand`, `IQuery`, `ICommandHandler`, and `IQueryHandler`.
* **Exception Handling:** Centralized exception middleware mapping domain/system errors to standard Problem Details responses.
* **MediatR Pipeline Behaviors:**
  * `ValidationBehaviour`: Scans the executing assembly for FluentValidation rules and validates requests before handlers run.
  * `LoggingBehavior`: Performance monitoring logs that trigger warning alerts if a request takes longer than 3 seconds.

---

## 🚀 Getting Started & Local Setup

### Infrastructure Prerequisites
To start the backing services (PostgreSQL, Redis, and pgAdmin), execute the docker-compose setup:
```bash
docker-compose up -d
```

### Connection Settings
Update each service's `appsettings.json` connection strings:
* **PostgreSQL (Marten & EF Core):** `"Host=localhost;Database=InstashopDb;Username=postgres;Password=postgres"`
* **Redis Caching:** `"localhost:6379"`
* **gRPC Endpoint URL:** `"http://localhost:5002"`
