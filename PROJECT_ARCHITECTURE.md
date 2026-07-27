# 🏗️ Instashop Architecture Deep Dive

## 📌 Project Vision & Overview
**Instashop** is a state-of-the-art e-commerce microservices platform built on **.NET 10**. It serves as a comprehensive reference architecture for building scalable, maintainable, and highly performant enterprise systems. 

This document outlines the architectural patterns, bounded contexts, execution flows, and engineering guidelines that govern the Instashop codebase.

---

## 🧩 Core Architectural Patterns

### 1. Hybrid Architecture Strategy
We reject the "one size fits all" approach. Services use the architecture that best fits their domain complexity:

*   **Vertical Slice Architecture (Catalog, Basket):** 
    Features are organized by folders ("slices") rather than technical layers. The endpoint, MediatR command, handler, and validators live side-by-side. This maximizes cohesion and minimizes navigation overhead for simple CRUD-heavy domains.
*   **Clean Architecture & DDD (Ordering):** 
    Divided into Domain, Application, Infrastructure, and API layers. This is essential for the Ordering service, which contains complex business logic, rich domain events, and strict invariants that must be protected.

### 2. CQRS (Command Query Responsibility Segregation)
Every microservice strictly segregates read operations from write operations using **MediatR**:
*   **Commands (Writes):** Change system state. Handled by `ICommandHandler`.
*   **Queries (Reads):** Retrieve system state. Handled by `IQueryHandler`.
*   *Advantage:* We can independently scale and optimize read and write paths, applying caching to queries while wrapping commands in database transactions.

### 3. Event-Driven Messaging
Services are decoupled using **RabbitMQ** and **MassTransit**.
*   Instead of synchronous HTTP calls (which cause cascading failures), services publish integration events (e.g., `BasketCheckoutEvent`).
*   Subscribing services react to these events asynchronously, ensuring **eventual consistency** and high fault tolerance.

### 4. Microservices Snapshot Pattern
Data immutability is maintained across service boundaries using the Snapshot Pattern. For example, when an order is created in the **Ordering** service, data like `ProductName` is copied from the incoming payload (originally from Catalog) and persisted directly into the `OrderItem` table. This decouples the Order from the Catalog, ensuring that historical receipts remain 100% accurate even if the original product is renamed or deleted.

---

## 📦 Bounded Contexts & Services

| Service | Architecture | Datastore | Responsibility |
| :--- | :--- | :--- | :--- |
| **Catalog.API** | Vertical Slice | Marten (PostgreSQL) | Product catalog, inventory, and categories. |
| **Basket.API** | Vertical Slice | Redis + Marten | User shopping carts. Uses Decorator pattern for caching. |
| **Ordering.API** | Clean Architecture | EF Core (PostgreSQL)| Order lifecycle, payment info, shipping details. |
| **Discount.Grpc** | gRPC Service | EF Core (SQLite) | High-speed RPC coupon calculation. |
| **Identity.API** | Minimal API | EF Core (PostgreSQL)| JWT issuance, user registration, role management. |
| **Media.API** | Minimal API | Local File System | Static asset and image hosting. |
| **YarpApiGateway**| Gateway | N/A | Centralized routing, rate limiting, and CORS handling. |
| **React Frontend**| SPA (Vite) | N/A | The customer-facing UI interacting with YARP. |

### 🌐 Service Dependency Diagram
This diagram illustrates the macro-level dependencies across all microservices, API Gateway, datastores, and message brokers.

```mermaid
graph TD
    Client[React Frontend] -->|HTTPS| YARP[YARP API Gateway]
    YARP -->|Route /catalog| CatalogAPI[Catalog.API]
    YARP -->|Route /basket| BasketAPI[Basket.API]
    YARP -->|Route /ordering| OrderingAPI[Ordering.API]
    YARP -->|Route /identity| IdentityAPI[Identity.API]
    YARP -->|Route /media| MediaAPI[Media.API]
    
    BasketAPI -->|gRPC| DiscountGrpc[Discount.Grpc]
    
    CatalogAPI -->|Marten| CatalogDB[(Catalog PostgreSQL)]
    BasketAPI -->|Marten| BasketDB[(Basket PostgreSQL)]
    BasketAPI -->|Cache| RedisCache[(Redis)]
    OrderingAPI -->|EF Core| OrderDB[(Ordering PostgreSQL)]
    DiscountGrpc -->|EF Core| DiscountDB[(SQLite)]
    IdentityAPI -->|EF Core| IdentityDB[(Identity PostgreSQL)]
    MediaAPI -->|File I/O| LocalStorage[(Local File System)]
    
    BasketAPI -.->|Publish Event| RabbitMQ{RabbitMQ / MassTransit}
    CatalogAPI -.->|Publish Event| RabbitMQ
    RabbitMQ -.->|Consume Event| OrderingAPI
    RabbitMQ -.->|Consume Event| BasketAPI
```

### 🗄️ Database Schema & Storage
Each service owns its domain data exclusively. Services use Marten (Document DB on Postgres) or EF Core (Relational).

```mermaid
erDiagram
    %% Catalog Service
    Product {
        guid Id PK
        string Name
        string Description
        decimal Price
        string Category
    }
    
    %% Basket Service
    ShoppingCart {
        string UserName PK
        decimal TotalPrice
    }
    ShoppingCartItem {
        guid ProductId
        string ProductName
        int Quantity
        decimal Price
    }
    ShoppingCart ||--o{ ShoppingCartItem : contains
    
    %% Ordering Service
    Order {
        guid Id PK
        guid CustomerId
        string OrderName
        string Status
        decimal TotalPrice
    }
    OrderItem {
        guid Id PK
        guid OrderId FK
        guid ProductId
        string ProductName
        decimal Price
        int Quantity
    }
    Order ||--o{ OrderItem : has
    
    %% Identity Service
    ApplicationUser {
        string Id PK
        string UserName
        string Email
        string PasswordHash
    }
```

---

## 🛠️ The `BuildingBlocks` Core

To prevent code duplication, cross-cutting concerns are extracted into a shared `BuildingBlocks` library:

1. **MediatR Pipeline Behaviors:**
   * `ValidationBehavior`: Automatically validates every incoming request using FluentValidation before it ever reaches the handler.
   * `LoggingBehavior`: Logs request entry, exit, and execution time (warning if execution exceeds 3 seconds).
2. **Global Exception Handling:**
   * A centralized `CustomExceptionHandler` catches domain exceptions and maps them to RFC 7807 compliant `ProblemDetails` (e.g. mapping `NotFoundException` to a HTTP 404 response).
3. **Messaging Setup:**
   * Standardized MassTransit/RabbitMQ configurations to easily publish and consume events across microservices.
4. **Authentication:**
   * Shared JWT verification extensions to ensure consistent security across all internal APIs.

---

## 🚀 Execution Flows

### 1. API Endpoint Mapping (YARP Gateway)
The API Gateway acts as the single entry point, routing requests based on path prefixes.

```mermaid
graph LR
    Client([Client Apps / React UI]) --> YARP{YARP Gateway}
    
    YARP -->|/api/catalog/*| Catalog[Catalog.API]
    YARP -->|/api/basket/*| Basket[Basket.API]
    YARP -->|/api/ordering/*| Ordering[Ordering.API]
    YARP -->|/api/identity/*| Identity[Identity.API]
    YARP -->|/api/media/*| Media[Media.API]
```

### 2. Standard API Request (CQRS + Validation)
```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API as Carter Endpoint
    participant Pipe as MediatR Pipeline
    participant Handler as Feature Handler
    participant DB as Database

    Client->>API: HTTP POST /api/products
    API->>Pipe: Send(CreateProductCommand)
    Pipe->>Pipe: 1. Logging Behavior (Start)
    Pipe->>Pipe: 2. Validation Behavior
    alt Invalid
        Pipe-->>Client: 400 Bad Request
    else Valid
        Pipe->>Handler: Handle()
        Handler->>DB: Save to DB
        DB-->>Handler: Success
        Handler-->>Pipe: Return Result
        Pipe->>Pipe: 1. Logging Behavior (End)
        Pipe-->>API: Return Result
        API-->>Client: 201 Created
    end
```

### 3. Authentication & Authorization Flow
```mermaid
sequenceDiagram
    participant User as React Frontend
    participant YARP as YarpApiGateway
    participant Identity as Identity.API
    participant DB as Identity DB (PostgreSQL)

    User->>YARP: POST /identity/auth/login
    YARP->>Identity: Forward Request
    Identity->>DB: Verify Credentials
    DB-->>Identity: Success
    Identity->>Identity: Generate JWT Token
    Identity-->>YARP: Return JWT & Claims
    YARP-->>User: 200 OK (JWT Token)
    User->>User: Store Token (Local Storage/Cookie)
    
    Note over User,YARP: Subsequent Authenticated Requests
    User->>YARP: GET /basket (Bearer <token>)
    YARP->>YARP: Validate JWT (Fallback Middleware)
    YARP->>Basket.API: Forward Authenticated Request
```

### 4. Event-Driven Checkout Flow
```mermaid
sequenceDiagram
    participant User as React Frontend
    participant Basket as Basket.API
    participant MQ as RabbitMQ
    participant Ordering as Ordering.API

    User->>Basket: POST /basket/checkout
    Basket->>Basket: Validate Cart & Apply Discounts
    Basket->>MQ: Publish BasketCheckoutEvent
    Basket-->>User: 202 Accepted
    Note over MQ: Asynchronous Delivery
    MQ->>Ordering: Consume BasketCheckoutEvent
    Ordering->>Ordering: Create Order (Domain Logic)
    Ordering->>DB: Save Order
```

### 5. Generalized Event-Driven Communication
```mermaid
graph LR
    subgraph Publishers
        BasketAPI[Basket.API]
        CatalogAPI[Catalog.API]
    end
    
    subgraph Message Broker
        RMQ((RabbitMQ))
        Exchange[Event Bus Exchange]
        RMQ --- Exchange
    end
    
    subgraph Consumers
        OrderingAPI[Ordering.API]
        SearchService[Search / Analytics]
    end
    
    BasketAPI -->|BasketCheckoutEvent| Exchange
    CatalogAPI -->|ProductPriceChangedEvent| Exchange
    
    Exchange -->|Queue| OrderingAPI
    Exchange -->|Queue| SearchService
    Exchange -->|Queue| BasketAPI
```

---

## 💻 Frontend Component Hierarchy
The React SPA consumes the microservices via the YARP gateway.

```mermaid
graph TD
    App[App (Main Layout)]
    App --> Router[React Router]
    
    Router --> Navbar[Navbar]
    Router --> Footer[Footer]
    
    Router --> Home[Home Page]
    Router --> ProductList[Product Catalog Page]
    Router --> ProductDetail[Product Detail Page]
    Router --> Cart[Shopping Cart Page]
    Router --> Checkout[Checkout Page]
    Router --> Profile[User Profile]
    
    ProductList --> FilterSidebar[Filter & Sort]
    ProductList --> ProductCard[Product Card x N]
    
    Cart --> CartItem[Cart Item Row x N]
    Cart --> OrderSummary[Order Summary]
```

---

## 🐳 Deployment Architecture
The platform is orchestrated via Docker, isolating dependencies and standardizing the runtime environment.

```mermaid
graph TB
    subgraph Docker Host
        subgraph Infrastructure Containers
            PG[(PostgreSQL)]
            Redis[(Redis)]
            RMQ[(RabbitMQ)]
        end
        
        subgraph App Containers
            YARP[YARP Gateway]
            UI[React Frontend]
            Identity[Identity.API]
            Catalog[Catalog.API]
            Basket[Basket.API]
            Ordering[Ordering.API]
            Discount[Discount.Grpc]
            Media[Media.API]
        end
        
        UI --> YARP
        YARP --> Identity
        YARP --> Catalog
        YARP --> Basket
        YARP --> Ordering
        YARP --> Media
        
        Basket --> Discount
        
        Identity --> PG
        Catalog --> PG
        Basket --> PG
        Basket --> Redis
        Ordering --> PG
        
        Basket -.-> RMQ
        Catalog -.-> RMQ
        Ordering -.-> RMQ
    end
```

---

## 💡 Engineering Guidelines & Rules

If you are developing or modifying code in this repository, you **must** adhere to the following rules:

1. **Keep Endpoints Thin:** Carter endpoints and API Controllers must contain zero business logic. They should only map requests, send them to MediatR, and return HTTP status codes.
2. **Respect the Architecture:** 
   * In `Catalog` and `Basket`, put your Command, Handler, and Validator in the same folder.
   * In `Ordering`, strictly maintain Clean Architecture isolation. `OrderingDomain` must have no dependencies on infrastructure or application layers.
3. **Aggregate Mutations:** When updating an aggregate root (like `Order`), orchestrate the changes exclusively through the aggregate's methods (e.g., `order.AddOrderItem()`). Never mutate child entities directly.
4. **Domain Events:** Use `DispatchDomainEventInterceptor` to dispatch events triggered by aggregates. Always call `ClearDomainEvents()` after dispatch to prevent infinite loops.
5. **Modern C# Features:** Use C# 12 primary constructors for dependency injection (e.g., `public class GetProductsHandler(IDocumentSession session) { ... }`).
6. **EF Core & Enums:** If configuring an enum property with a database-generated default, configure the sentinel value via `.HasSentinel((EnumType)0)` and register `JsonStringEnumConverter` for JSON serialization.
7. **CORS Configuration:** Ensure CORS policies are correctly propagated via YARP and fallback middleware to support the React frontend.
