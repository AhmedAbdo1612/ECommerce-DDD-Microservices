# Instashop Project Architecture

## 📌 Project Overview
**Instashop** is a modern e-commerce microservices application built with **.NET 10**. The solution demonstrates scalability, maintainability, and domain-driven design by partitioning the system into bounded contexts and employing optimized architectures based on each service's complexity.

---

## 🏗️ Architectural Patterns

### 1. Hybrid Architectures
Depending on the service's complexity, we use different architectural patterns:
*   **Vertical Slice Architecture (Catalog, Basket):** Features are organized by feature folders ("slices") rather than technical layers. The endpoint, MediatR command/query, handler, and validators are colocated. This reduces navigation overhead and ensures that changes to a feature are localized.
*   **Clean Architecture (Ordering):** Divided into domain, application, infrastructure, and API layers to handle complex enterprise business logic, rich domain events, and state mapping.

### 2. CQRS (Command Query Responsibility Segregation)
All services strictly segregate read (Queries) and write (Commands) operations using the **CQRS** pattern, orchestrated by **MediatR**:
*   **Commands:** Represent intentions to change application state (e.g., `CreateProductCommand`). Implements `ICommand` and is handled by `ICommandHandler`.
*   **Queries:** Represent requests to retrieve application state (e.g., `GetProductsQuery`). Implements `IQuery` and is handled by `IQueryHandler`.
*   **Benefit:** This allows for independent optimization of read and write paths (e.g., using a cache for queries while writing directly to the database).

### 3. Domain-Driven Design (DDD)
The system is designed around domain models that encapsulate business logic and state, particularly in the Ordering service:
*   **Entities & Aggregate Roots:** Enforce business invariants (e.g., `Order`, `Product`).
*   **Value Objects:** Immutable types without identity (e.g., `Address`, `Payment`, `OrderName`).
*   **Domain Events:** Triggered when state changes, dispatched using `DispatchDomainEventInterceptor` before EF database transactions commit.
*   **Bounded Contexts:** Each microservice operates within its own bounded context with its own isolated database.

---

## 🛠️ Technology Stack

| Component | Technology | Bounded Context / Purpose |
| :--- | :--- | :--- |
| **Framework** | .NET 10 | Core runtime for all services |
| **Minimal APIs** | **Carter** | Catalog & Basket API endpoint routing |
| **REST APIs** | **Controllers** | Ordering API endpoint routing |
| **RPC Communication** | **gRPC** | Discount.Grpc service communication |
| **Mediator** | **MediatR** | Decoupling endpoints from feature handlers |
| **Document Store** | **Marten (PostgreSQL)** | Catalog & Basket NoSQL document store |
| **Relational Database** | **EF Core + PostgreSQL** | Ordering service data store |
| **Local Database** | **EF Core + SQLite** | Discount service lightweight data store |
| **Distributed Cache** | **Redis** | Cached Basket Repository decorator |
| **Validation** | **FluentValidation** | MediatR pipeline automatic request validation |
| **Mapping** | **Mapster** | Request/Response and Entity/DTO mapping |
| **Containerization**| **Docker & Docker Compose** | Local orchestrations of microservices |

---

## 📦 Service Breakdown & Data Management

### 🛍️ Catalog Service (`Catalog.API`)
*   **Pattern:** Vertical Slice Architecture
*   **Database:** Marten (PostgreSQL Document Store)
*   **Responsibilities:** Inventory, category management, product listings, pagination.

### 🛒 Basket Service (`Baket.API`)
*   **Pattern:** Vertical Slice Architecture
*   **Database:** Marten (PostgreSQL Document Store) + Redis (caching)
*   **Caching Strategy:** Decorator pattern via `CachedBasketRepository` wrapping the database repository.
*   **Dependencies:** Consumes `Discount.Grpc` to fetch and apply coupon amounts.

### 🏷️ Discount Service (`Discount.Grpc`)
*   **Pattern:** gRPC Service
*   **Database:** EF Core (SQLite, database file `DiscountDb.db`)
*   **Responsibilities:** High-performance gRPC server handling coupon discounts (`GetDiscount`, `CreateDiscount`, `UpdateDiscount`, `DeleteDiscount`).

### 📦 Ordering Service (`Ordering`)
*   **Pattern:** Clean Architecture (DDD)
*   **Database:** EF Core (PostgreSQL)
*   **Layers:**
    *   `OrderingDomain`: Core domain entities (`Customer`, `Product`, `Order`, `OrderItem`), value objects, custom exceptions, and domain events.
    *   `Ordering.Application`: MediatR commands/queries, mapping (Mapster), DTO definitions, and data abstractions (`IApplicationDbContext`).
    *   `Ordering.Infrastructure`: Data access implementations (`ApplicationDbContext` with EF configurations, migrators, entity interceptors).
    *   `Ordering.API`: Web controllers delivering endpoints and calling the MediatR pipeline.

---

## 🧩 Cross-Cutting Concerns (`BuildingBlocks`)

The `BuildingBlocks` project provides shared abstractions and behaviors used across all microservices:

*   **CQRS Abstractions:** Defines `ICommand`, `IQuery`, and their respective handlers.
*   **MediatR Pipeline Behaviors:**
    *   **ValidationBehavior:** Automatically validates every `ICommand` using FluentValidation before it reaches the handler.
    *   **LoggingBehavior:** Provides standardized request/response logging and performance monitoring (logs warnings for requests taking longer than 3 seconds).
*   **Exception Handling:** Centralized middleware for capturing and formatting API errors.

---

## 📂 Directory Structure

```text
Instashop/
├── BuildingBlocks/                 # Shared abstractions, CQRS interfaces, and pipeline behaviors
│   └── BuildingBlocks/             # Cross-cutting concerns (Behaviours, Exceptions, Pagination)
├── Services/
│   ├── Catalog/
│   │   └── Catalog.API/            # Catalog Microservice (Vertical Slice, Marten)
│   │       ├── Products/           # Feature slices (e.g. CreateProduct, GetProducts)
│   │       └── Models/             # Catalog Entities
│   ├── Basket/
│   │   └── Baket.API/              # Basket Microservice (Vertical Slice, Marten + Redis)
│   │       ├── Basket/             # Feature slices (e.g. StoreBasket, GetBasket)
│   │       └── Data/               # Repositories (Decorated Caching Logic)
│   ├── Discount/
│   │   └── Discount.Grpc/          # Discount RPC Service (gRPC, EF Core + SQLite)
│   │       ├── Data/               # DiscountContext & Extensions
│   │       ├── Protos/             # Protocol Buffer contract (discount.proto)
│   │       └── Services/           # Discount gRPC Service Handlers
│   └── Ordering/                   # Ordering Microservice (Clean Architecture + DDD)
│       ├── OrderingDomain/         # Domain (Models, ValueObjects, Events, Exceptions)
│       ├── Ordering.Application/   # Application logic (Commands, Queries, DTOs, IApplicationDbContext)
│       ├── Ordering.Infrastructure/# Infra (ApplicationDbContext, Configurations, Interceptors)
│       └── Ordering.API/           # Presentation layer (Controllers, Endpoints)
└── docker-compose.yml              # Infrastructural setup (PostgreSQL, Redis, pgAdmin)
```

---

## 🚀 Execution Flow

```mermaid
graph TD
    Client[Client Request] -->|REST/HTTP| API[Carter Minimal API / Controllers]
    Client -->|gRPC/RPC| RPC[gRPC Discount Service]
    API -->|Mapster| Map[Map Request to Command/Query]
    Map -->|MediatR Send| Pipe[Pipeline Behaviors]
    Pipe -->|1. LoggingBehavior| PipeVal[2. ValidationBehavior]
    PipeVal -->|Handle| Handler[MediatR Handler]
    Handler -->|Domain Operations| Domain[Domain Entities & Rules]
    Domain -->|Save| DB[(Marten / PostgreSQL / SQLite / Redis)]
    DB -->|Return Status/Data| Handler
    Handler -->|Mapster| DTO[Map Entity to DTO / Response]
    DTO -->|HTTP Response| Client
```
