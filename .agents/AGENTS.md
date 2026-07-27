# Instashop Project Architecture

## 📌 Project Vision & Overview
**Instashop** is a state-of-the-art e-commerce microservices platform built on **.NET 10**. It serves as a comprehensive reference architecture for building scalable, maintainable, and highly performant enterprise systems. 

This document outlines the architectural patterns, bounded contexts, execution flows, and engineering guidelines that govern the Instashop codebase. It serves as the primary system context for AI agents and developers working on this codebase.

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

---

## 🛠️ The `BuildingBlocks` Core

To prevent code duplication, cross-cutting concerns are extracted into a shared `BuildingBlocks` library:

1. **Global Exception Handling:**
   * A centralized `CustomExceptionHandler` catches domain exceptions and maps them to RFC 7807 compliant `ProblemDetails` (e.g. mapping `NotFoundException` to a HTTP 404 response).
2. **Messaging Setup:**
   * Standardized MassTransit/RabbitMQ configurations to easily publish and consume events across microservices.
3. **Authentication:**
   * Shared JWT verification extensions to ensure consistent security across all internal APIs.

---

## 🚀 Execution Flows

### 1. Standard API Request (CQRS + Explicit Validation)

Instead of hiding validation logic inside implicit MediatR pipeline behaviors, we explicitly validate requests right inside the Handlers or Carter Endpoints using **FluentValidation**. This provides granular control and predictability.

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant API as Carter Endpoint
    participant Val as FluentValidation
    participant MediatR as MediatR
    participant Handler as Feature Handler
    participant DB as Database

    Client->>API: HTTP POST /api/orders
    API->>Val: Validate Request explicitly
    alt Invalid
        Val-->>API: Throw ValidationException
        API-->>Client: 400 Bad Request (via ExceptionHandler)
    else Valid
        API->>MediatR: Send(Command)
        MediatR->>Handler: Handle()
        Handler->>DB: Mutate State & SaveChangesAsync()
        DB-->>Handler: Success
        Handler-->>API: Return Result DTO
        API-->>Client: 201 Created
    end
```

### 2. Event-Driven Checkout Flow
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
