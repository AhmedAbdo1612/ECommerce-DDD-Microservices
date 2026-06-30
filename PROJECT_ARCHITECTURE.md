# Instashop Project Architecture

## 📌 Project Overview
**Instashop** is a modern e-commerce microservices application built with **.NET 10**. The project demonstrates a sophisticated blend of architectural patterns designed for scalability, maintainability, and high performance. It focuses on separating concerns while keeping related business logic together.

---

## 🏗️ Architectural Patterns

### 1. Vertical Slice Architecture
Unlike traditional N-Tier or Clean Architecture that separates code by technical layers (e.g., `Application`, `Domain`, `Infrastructure`), Instashop uses **Vertical Slice Architecture**.
- **Feature-Based Grouping:** Each request (e.g., `CreateProduct`, `GetBasket`) is treated as a "slice."
- **Colocation:** The endpoint, the command/query, the handler, and the validator for a specific feature are located in the same folder. This reduces navigation overhead and ensures that changes to a feature are localized.

### 2. CQRS (Command Query Responsibility Segregation)
The project strictly separates read and write operations using the **CQRS** pattern, orchestrated by **MediatR**:
- **Commands:** Represent intentions to change state (e.g., `CreateProductCommand`). They are handled by `ICommandHandler`.
- **Queries:** Represent requests to retrieve data (e.g., `GetProductsQuery`). They are handled by `IQueryHandler`.
- **Benefit:** This allows for independent optimization of read and write paths (e.g., using a cache for queries while writing directly to the database).

### 3. Domain-Driven Design (DDD)
The system is designed around domain models that encapsulate business logic and state:
- **Domain Models:** Entities like `Product` and `ShoppingCart` represent the core business concepts.
- **Bounded Contexts:** Each microservice (`Catalog`, `Basket`) operates within its own bounded context with its own database.

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | .NET 10 | Core runtime and API framework |
| **API Routing** | **Carter** | Simplifies the mapping of Minimal APIs |
| **Mediator** | **MediatR** | Decouples endpoints from business logic handlers |
| **Database** | **PostgreSQL** via **Marten** | Uses Postgres as a Document Store (NoSQL style) |
| **Caching** | **Redis** | Distributed caching for the Basket service |
| **Validation** | **FluentValidation** | Declarative validation of incoming requests |
| **Mapping** | **Mapster** | High-performance object-to-object mapping |
| **Containerization**| **Docker & Docker Compose** | Service orchestration and environment consistency |

---

## 📦 Service Breakdown

### 🛍️ Catalog Service (`Catalog.API`)
Responsible for managing the product inventory.
- **Data Store:** Marten (PostgreSQL).
- **Key Features:** Product creation, deletion, and retrieval (with pagination and category filtering).
- **Pattern:** Pure Vertical Slices with MediatR.

### 🛒 Basket Service (`Baket.API`)
Responsible for managing user shopping carts.
- **Data Store:** Marten (PostgreSQL).
- **Caching Strategy:** Implements the **Decorator Pattern**. `CachedBasketRepository` wraps the standard `BasketRepository` to provide a Redis-backed caching layer, significantly reducing database load.
- **Key Features:** Store, retrieve, and delete shopping carts.

---

## 🧩 Cross-Cutting Concerns (`BuildingBlocks`)

The `BuildingBlocks` project provides shared abstractions and behaviors used across all microservices:

- **CQRS Abstractions:** Defines `ICommand`, `IQuery`, and their respective handlers.
- **MediatR Pipeline Behaviors:**
    - **ValidationBehavior:** Automatically validates every `ICommand` using FluentValidation before it reaches the handler.
    - **LoggingBehavior:** Provides standardized request/response logging and performance monitoring (logs warnings for requests taking longer than 3 seconds).
- **Exception Handling:** Centralized middleware for capturing and formatting API errors.

---

## 📂 Directory Structure

```text
Instashop/
├── BuildingBlocks/           # Shared abstractions, CQRS interfaces, and MediatR behaviors
├── Services/
│   ├── Catalog/
│   │   └── Catalog.API/      # Catalog Microservice
│   │       ├── Products/     # Vertical Slices (CreateProduct, GetProducts, etc.)
│   │       ├── Models/       # Domain Entities
│   │       └── Program.cs    # Service Configuration
│   └── Basket/
│       └── Baket.API/        # Basket Microservice
│           ├── Basket/       # Vertical Slices (StoreBasket, GetBasket, etc.)
│           ├── Data/         # Repositories & Caching Logic
│           ├── Models/       # Domain Entities
│           └── Program.cs    # Service Configuration
├── docker-compose.yml        # Infrastructure orchestration (Postgres, Redis)
└── Instashop.slnx            # Solution file
```

---

## 🚀 Execution Flow
1. **Request** $ightarrow$ `Carter Endpoint`
2. **Endpoint** $ightarrow$ `Mapster` (Request $ightarrow$ Command/Query)
3. **Command/Query** $ightarrow$ `MediatR`
4. **Pipeline** $ightarrow$ `ValidationBehavior` $ightarrow$ `LoggingBehavior`
5. **Handler** $ightarrow$ `Domain Logic` $ightarrow$ `Marten/Redis`
6. **Response** $ightarrow$ `Mapster` (Result $ightarrow$ Response) $ightarrow$ **Client**
