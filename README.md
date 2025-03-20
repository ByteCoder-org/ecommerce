# E-Commerce Microservices Platform - Project Documentation

## 1. Project Overview

### 1.1 Introduction

This project aims to build a scalable e-commerce platform using microservices architecture. The platform will handle various aspects of an online store, including user management, product catalog, shopping cart, orders, payments, and notifications. Each feature is implemented as a separate microservice for independent development, deployment, and scaling.

### 1.2 Objectives

- Create a scalable, maintainable e-commerce platform
- Implement best practices in microservices architecture
- Utilize containerization for consistent deployments
- Apply modern development workflows and tooling
- Incorporate centralized logging and monitoring
- Enable independent scaling of each component

### 1.3 Scope

- Core microservices (User, Product, Cart, Order, Payment, Notification)
- Supporting infrastructure (API Gateway, Service Discovery)
- DevOps pipeline setup
- Centralized logging and monitoring
- Documentation for all components

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
Client → API Gateway → Microservices (User, Product, Cart, Order, Payment, Notification)
                    ↳ Authentication & Authorization (JWT/OAuth2)
                    ↳ Service Discovery (Eureka)
                    ↳ Caching (Redis)
                    ↳ Databases (PostgreSQL/MongoDB)
                    ↳ Message Broker (Kafka)
                    ↳ Logging & Monitoring (ELK Stack)
```

### 2.2 Core Microservices


| Service                     | Responsibility                                        | Primary Technology                         |
| --------------------------- | ----------------------------------------------------- | ------------------------------------------ |
| **User Service**            | User registration, authentication, profile management | Spring Boot, PostgreSQL, JWT               |
| **Product Catalog Service** | Product listings, categories, search                  | Spring Boot, PostgreSQL, Elasticsearch     |
| **Shopping Cart Service**   | Manage cart items                                     | Spring Boot, Redis                         |
| **Order Service**           | Order processing, history, status                     | Spring Boot, PostgreSQL, Kafka             |
| **Payment Service**         | Payment processing, integrations                      | Spring Boot, PostgreSQL, Stripe/PayPal API |
| **Notification Service**    | Email/SMS notifications                               | Spring Boot, Kafka, Twilio/SendGrid        |

### 2.3 Supporting Components


| Component                    | Purpose                            | Technology                     |
| ---------------------------- | ---------------------------------- | ------------------------------ |
| **API Gateway**              | Entry point, routing, security     | Kong                           |
| **Service Discovery**        | Service registration and discovery | Eureka                         |
| **Message Broker**           | Event-driven communication         | Kafka                          |
| **Caching**                  | Performance optimization           | Redis                          |
| **Logging & Monitoring**     | Centralized observability          | ELK Stack, Prometheus, Grafana |
| **Configuration Management** | Centralized config                 | Spring Cloud Config            |

## 3. Technology Stack

### 3.1 Core Technologies


| Category              | Technology              | Justification                           |
| --------------------- | ----------------------- | --------------------------------------- |
| **Framework**         | Spring Boot             | Industry standard with robust ecosystem |
| **Containerization**  | Docker & Docker Compose | Consistent development and deployment   |
| **API Documentation** | OpenAPI (Swagger)       | Interactive documentation               |
| **Authentication**    | JWT/OAuth2              | Secure, stateless authentication        |
| **CI/CD**             | GitHub Actions          | Automated testing and deployment        |
| **API Gateway**       | Kong                    | Robust routing, security, rate limiting |

### 3.2 Data Storage


| Service             | Storage Technology         | Justification                               |
| ------------------- | -------------------------- | ------------------------------------------- |
| **User Service**    | PostgreSQL                 | ACID compliance for user data               |
| **Product Catalog** | PostgreSQL + Elasticsearch | Structured storage with search capabilities |
| **Cart Service**    | Redis                      | Fast, in-memory storage for ephemeral data  |
| **Order Service**   | PostgreSQL                 | Transaction support for order processing    |
| **Payment Service** | PostgreSQL                 | ACID compliance for financial data          |

### 3.3 Implementation Technologies by Service

#### User Service

- Spring Boot
- Spring Security with JWT
- PostgreSQL
- SLF4J with Logback (JSON format)

#### Product Catalog Service

- Spring Boot
- PostgreSQL
- Elasticsearch (for search)
- GraphQL (flexible queries)
- Log4j2 (JSON format)

#### Shopping Cart Service

- Spring Boot
- Redis
- Java Util Logging

#### Order Service

- Spring Boot
- PostgreSQL
- Kafka (event publishing)
- Google's Flogger

#### Payment Service

- Spring Boot
- PostgreSQL
- External API integrations (Stripe/PayPal)
- SLF4J with Logback

#### Notification Service

- Spring Boot
- Kafka (event consumption)
- SendGrid/Twilio APIs
- SLF4J with Logback

## 4. Development Guidelines

### 4.1 Project Structure

- Follow standard Spring Boot directory structure:

  - `src/main/java` - Application source code
  - `src/main/resources` - Configuration files
  - `src/test/java` - Unit and integration tests
- Maintain separate packages per microservice:

  - `com.ecommerce.user`
  - `com.ecommerce.product`
  - `com.ecommerce.cart`
  - `com.ecommerce.order`
  - `com.ecommerce.payment`
  - `com.ecommerce.notification`
- Use layered architecture:

  - `controller` - REST endpoints
  - `service` - Business logic
  - `repository` - Database interactions
  - `model` - Entity representations
  - `config` - Configuration classes
  - `exception` - Custom exceptions
  - `dto` - Data transfer objects

### 4.2 Coding Standards

- **Java Naming Conventions**:

  - Classes: `PascalCase` (e.g., `OrderService`)
  - Variables/methods: `camelCase` (e.g., `getUserDetails`)
  - Constants: `UPPER_CASE_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)
- **Logging Best Practices**:

  - Use structured logging (JSON format)
  - Log meaningful events (API calls, errors, transactions)
  - Include context information (request IDs, user IDs)
  - Avoid logging sensitive information
  - Use appropriate log levels (ERROR, WARN, INFO, DEBUG)
- **Error Handling**:

  - Use `@ControllerAdvice` for centralized exception handling
  - Define custom exceptions for specific scenarios
  - Return meaningful HTTP status codes
  - Provide clear error messages
  - Log exceptions with stack traces at appropriate levels

### 4.3 Branching Strategy

- Follow Git Flow:

  - `main` - Stable production-ready code
  - `develop` - Ongoing development
  - `feature/*` - Feature branches
  - `hotfix/*` - Urgent fixes
  - `release/*` - Pre-production testing
- Pull request process:

  - Create feature branch from `develop`
  - Implement feature with tests
  - Create PR against `develop`
  - Require code review approval
  - Merge only after CI/CD pipeline passes
- Commit message format:

  - `[Feature] Implement user authentication`
  - `[Bugfix] Fix cart item removal issue`
  - `[Refactor] Improve error handling in Order service`

### 4.4 API Documentation

- Use Springdoc OpenAPI for API documentation:

  - Add dependency:

    ```xml
    <dependency>    <groupId>org.springdoc</groupId>    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>    <version>2.3.0</version></dependency>
    ```
  - Access Swagger UI at: `http://localhost:8080/swagger-ui.html`
- Document APIs using annotations:

  ```java
  @Tag(name = "User Management", description = "Operations related to users")
  @RestController
  @RequestMapping("/users")
  public class UserController {
      @Operation(summary = "Get user by ID", description = "Fetches a user based on ID")
      @ApiResponses(value = {
          @ApiResponse(responseCode = "200", description = "User found"),
          @ApiResponse(responseCode = "404", description = "User not found")
      })
      @GetMapping("/{id}")
      public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
          UserDTO user = userService.findById(id);
          return ResponseEntity.ok(user);
      }
  }
  ```
- Implement API versioning via:

  - URI versioning: `/api/v1/users`
  - Accept header versioning: `Accept: application/vnd.company.app-v1+json`

## 5. Database Design

### 5.1 User Service Schema (PostgreSQL)

**Users Table**


| Column     | Type         | Constraints               |
| ---------- | ------------ | ------------------------- |
| id         | UUID         | PRIMARY KEY               |
| username   | VARCHAR(50)  | UNIQUE, NOT NULL          |
| email      | VARCHAR(100) | UNIQUE, NOT NULL          |
| password   | TEXT         | NOT NULL                  |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP |

### 5.2 Product Catalog Service Schema (PostgreSQL)

**Products Table**


| Column      | Type          | Constraints                   |
| ----------- | ------------- | ----------------------------- |
| id          | UUID          | PRIMARY KEY                   |
| name        | VARCHAR(100)  | NOT NULL                      |
| description | TEXT          |                               |
| price       | DECIMAL(10,2) | NOT NULL                      |
| stock       | INTEGER       | DEFAULT 0                     |
| category_id | UUID          | FOREIGN KEY -> categories(id) |
| created_at  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     |
| updated_at  | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP     |

**Categories Table**


| Column    | Type        | Constraints                   |
| --------- | ----------- | ----------------------------- |
| id        | UUID        | PRIMARY KEY                   |
| name      | VARCHAR(50) | NOT NULL                      |
| parent_id | UUID        | FOREIGN KEY -> categories(id) |

### 5.3 Shopping Cart Service Schema (Redis)

- **Key Structure**: `cart:{user_id}`
- **Value Format**: JSON object

```json
{
  "items": [
    {
      "productId": "uuid-here",
      "quantity": 2,
      "addedAt": "2025-03-18T10:30:00"
    }
  ],
  "lastUpdated": "2025-03-18T10:30:00"
}
```

### 5.4 Order Service Schema (PostgreSQL)

**Orders Table**


| Column           | Type          | Constraints               |
| ---------------- | ------------- | ------------------------- |
| id               | UUID          | PRIMARY KEY               |
| user_id          | UUID          | FOREIGN KEY -> users(id)  |
| total_amount     | DECIMAL(10,2) | NOT NULL                  |
| status           | VARCHAR(20)   | DEFAULT 'Pending'         |
| shipping_address | TEXT          | NOT NULL                  |
| created_at       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP |
| updated_at       | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP |

**Order_Items Table**


| Column     | Type          | Constraints                 |
| ---------- | ------------- | --------------------------- |
| id         | UUID          | PRIMARY KEY                 |
| order_id   | UUID          | FOREIGN KEY -> orders(id)   |
| product_id | UUID          | FOREIGN KEY -> products(id) |
| quantity   | INTEGER       | NOT NULL                    |
| price      | DECIMAL(10,2) | NOT NULL                    |

### 5.5 Payment Service Schema (PostgreSQL)

**Payments Table**


| Column         | Type          | Constraints               |
| -------------- | ------------- | ------------------------- |
| id             | UUID          | PRIMARY KEY               |
| order_id       | UUID          | FOREIGN KEY -> orders(id) |
| amount         | DECIMAL(10,2) | NOT NULL                  |
| payment_method | VARCHAR(50)   | NOT NULL                  |
| status         | VARCHAR(20)   | DEFAULT 'Pending'         |
| transaction_id | VARCHAR(100)  |                           |
| created_at     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP |
| updated_at     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP |

### 5.6 Database Migrations

- Use **Flyway** for version-controlled database migrations
- Store migration scripts in `src/main/resources/db/migration`
- Naming convention: `V1__Create_users_table.sql`, `V2__Add_indexes.sql`
- Document all migrations in a change log

## 6. API Endpoints

### 6.1 User Service


| Endpoint              | Method | Description         | Request Body                                                                          | Response                   |
| --------------------- | ------ | ------------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| `/api/users/register` | POST   | Register new user   | `{"username": "john_doe", "email": "john@example.com", "password": "securepassword"}` | `201 Created`              |
| `/api/users/login`    | POST   | User login          | `{"email": "john@example.com", "password": "securepassword"}`                         | `200 OK` with JWT token    |
| `/api/users/profile`  | GET    | Get user profile    | N/A                                                                                   | `200 OK` with user details |
| `/api/users/profile`  | PUT    | Update user profile | `{"username": "john_updated"}`                                                        | `200 OK`                   |

### 6.2 Product Catalog Service


| Endpoint               | Method | Description       | Request Body    | Response                      |
| ---------------------- | ------ | ----------------- | --------------- | ----------------------------- |
| `/api/products`        | GET    | List all products | N/A             | `200 OK` with product list    |
| `/api/products/{id}`   | GET    | Get product by ID | N/A             | `200 OK` with product details |
| `/api/products`        | POST   | Create product    | Product details | `201 Created`                 |
| `/api/products/{id}`   | PUT    | Update product    | Updated details | `200 OK`                      |
| `/api/products/search` | GET    | Search products   | Query params    | `200 OK` with search results  |

### 6.3 Shopping Cart Service


| Endpoint                | Method | Description           | Request Body                           | Response                 |
| ----------------------- | ------ | --------------------- | -------------------------------------- | ------------------------ |
| `/api/cart`             | GET    | View cart             | N/A                                    | `200 OK` with cart items |
| `/api/cart`             | POST   | Add item to cart      | `{"productId": "uuid", "quantity": 2}` | `200 OK`                 |
| `/api/cart/{productId}` | DELETE | Remove item from cart | N/A                                    | `204 No Content`         |
| `/api/cart/{productId}` | PUT    | Update item quantity  | `{"quantity": 3}`                      | `200 OK`                 |

### 6.4 Order Service


| Endpoint                  | Method | Description         | Request Body            | Response                    |
| ------------------------- | ------ | ------------------- | ----------------------- | --------------------------- |
| `/api/orders`             | POST   | Create order        | Order details           | `201 Created`               |
| `/api/orders`             | GET    | List user orders    | N/A                     | `200 OK` with order list    |
| `/api/orders/{id}`        | GET    | Get order details   | N/A                     | `200 OK` with order details |
| `/api/orders/{id}/status` | PUT    | Update order status | `{"status": "Shipped"}` | `200 OK`                    |

### 6.5 Payment Service


| Endpoint                        | Method | Description         | Request Body    | Response                      |
| ------------------------------- | ------ | ------------------- | --------------- | ----------------------------- |
| `/api/payments`                 | POST   | Process payment     | Payment details | `201 Created`                 |
| `/api/payments/{id}`            | GET    | Get payment details | N/A             | `200 OK` with payment details |
| `/api/payments/order/{orderId}` | GET    | Get order payments  | N/A             | `200 OK` with payment list    |

### 6.6 Notification Service


| Endpoint                           | Method | Description            | Request Body         | Response                        |
| ---------------------------------- | ------ | ---------------------- | -------------------- | ------------------------------- |
| `/api/notifications`               | POST   | Send notification      | Notification details | `202 Accepted`                  |
| `/api/notifications/user/{userId}` | GET    | Get user notifications | N/A                  | `200 OK` with notification list |

## 7. Logging and Monitoring

### 7.1 Centralized Logging with ELK Stack

```yaml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.3
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - ecommerce-network

  logstash:
    image: docker.elastic.co/logstash/logstash:7.17.3
    volumes:
      - ./logstash/config/logstash.yml:/usr/share/logstash/config/logstash.yml:ro
      - ./logstash/pipeline:/usr/share/logstash/pipeline:ro
    ports:
      - "5044:5044"
      - "5000:5000/tcp"
      - "5000:5000/udp"
      - "9600:9600"
    depends_on:
      - elasticsearch
    networks:
      - ecommerce-network

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.3
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_URL: http://elasticsearch:9200
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - ecommerce-network

volumes:
  elasticsearch-data:

networks:
  ecommerce-network:
    driver: bridge

```

### 7.2 Logging Configuration

#### User Service (Logback)

```xml
<configuration>
    <appender name="JSON_CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder class="net.logstash.logback.encoder.LogstashEncoder">
            <includeMdc>true</includeMdc>
            <customFields>{"service":"user-service","env":"${SPRING_PROFILES_ACTIVE:-dev}"}</customFields>
        </encoder>
    </appender>
  
    <appender name="ASYNC_JSON_CONSOLE" class="ch.qos.logback.classic.AsyncAppender">
        <appender-ref ref="JSON_CONSOLE" />
        <queueSize>512</queueSize>
        <discardingThreshold>0</discardingThreshold>
    </appender>
  
    <root level="INFO">
        <appender-ref ref="ASYNC_JSON_CONSOLE"/>
    </root>
  
    <logger name="com.ecommerce.user" level="DEBUG" />
    <logger name="org.springframework" level="INFO" />
    <logger name="org.hibernate" level="WARN" />
</configuration>

```

#### Product Service (Log4j2)

```xml
<Configuration status="WARN">
    <Properties>
        <Property name="SERVICE_NAME">product-service</Property>
        <Property name="ENV">${env:SPRING_PROFILES_ACTIVE:-dev}</Property>
    </Properties>
  
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <JsonLayout compact="true" eventEol="true">
                <KeyValuePair key="service" value="${SERVICE_NAME}" />
                <KeyValuePair key="env" value="${ENV}" />
            </JsonLayout>
        </Console>
    </Appenders>
  
    <Loggers>
        <Logger name="com.ecommerce.product" level="DEBUG" />
        <Logger name="org.springframework" level="INFO" />
        <Logger name="org.hibernate" level="WARN" />
      
        <Root level="INFO">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>

```

### 7.3 Structured Logging Guidelines

- Include standard fields in all logs:

  - `timestamp` - When the event occurred
  - `service` - Name of the microservice
  - `traceId` - Distributed tracing identifier
  - `level` - Log level (INFO, ERROR, etc.)
  - `message` - Human-readable message
  - `context` - Additional contextual data
- Use MDC (Mapped Diagnostic Context) to include request context:

  ```java
  // In request filter
  MDC.put("requestId", UUID.randomUUID().toString());
  MDC.put("userId", userId);

  // Log with context
  log.info("Processing payment for order {}", orderId);

  // Clear context after request
  MDC.clear();
  ```

### 7.4 Monitoring with Prometheus and Grafana

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.42.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
    networks:
      - ecommerce-network

  grafana:
    image: grafana/grafana:9.3.6
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_DOMAIN=localhost
    depends_on:
      - prometheus
    networks:
      - ecommerce-network

volumes:
  prometheus-data:
  grafana-data:

networks:
  ecommerce-network:
    external: true

```

## 8. Deployment Strategy

### 8.1 Docker Compose for Local Development

```yaml
version: '3.8'

services:
  # Core Infrastructure
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - ecommerce-network

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    networks:
      - ecommerce-network

  zookeeper:
    image: confluentinc/cp-zookeeper:7.3.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    networks:
      - ecommerce-network

  kafka:
    image: confluentinc/cp-kafka:7.3.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    networks:
      - ecommerce-network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.3
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
    networks:
      - ecommerce-network

  # Service Discovery
  eureka:
    image: ecommerce/eureka:latest
    build:
      context: ./eureka-server
      dockerfile: Dockerfile
    ports:
      - "8761:8761"
    networks:
      - ecommerce-network

  # API Gateway
  kong:
    image: kong:3.3
    depends_on:
      - kong-database
    environment:
      KONG_DATABASE: postgres
      KONG_PG_HOST: kong-database
      KONG_PG_USER: kong
      KONG_PG_PASSWORD: kong
      KONG_PROXY_ACCESS_LOG: /dev/stdout
      KONG_ADMIN_ACCESS_LOG: /dev/stdout
      KONG_PROXY_ERROR_LOG: /dev/stderr
      KONG_ADMIN_ERROR_LOG: /dev/stderr
      KONG_ADMIN_LISTEN: 0.0.0.0:8001
    ports:
      - "8000:8000"
      - "8001:8001"
    networks:
      - ecommerce-network

  kong-database:
    image: postgres:15
    environment:
      POSTGRES_USER: kong
      POSTGRES_DB: kong
      POSTGRES_PASSWORD: kong
    volumes:
      - kong-db-data:/var/lib/postgresql/data
    networks:
      - ecommerce-network

  # Microservices
  user-service:
    image: ecommerce/user-service:latest
    build:
      context: ./user-service
      dockerfile: Dockerfile
    depends_on:
      - postgres
      - eureka
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/users
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka:8761/eureka/
    ports:
      - "8081:8080"
    networks:
      - ecommerce-network

  product-service:
    image: ecommerce/product-service:latest
    build:
      context: ./product-service
      dockerfile: Dockerfile
    depends_on:
      - postgres
      - elasticsearch
      - eureka
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/products
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka:8761/eureka/
      ELASTICSEARCH_HOST: elasticsearch
    ports:
      - "8082:8080"
    networks:
      - ecommerce-network

  cart-service:
    image: ecommerce/cart-service:latest
    build:
      context: ./cart-service
      dockerfile: Dockerfile
    depends_on:
      - redis
      - eureka
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_REDIS_HOST: redis
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka:8761/eureka/
    ports:
      - "8083:8080"
    networks:
      - ecommerce-network

  order-service:
    image: ecommerce/order-service:latest
    build:
      context: ./order-service
      dockerfile: Dockerfile
    depends_on:
      - postgres
      - kafka
      - eureka
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/orders
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka:8761/eureka/
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:29092
    ports:
      - "8084:8080"
    networks:
      - ecommerce-network

  payment-service:
    image: ecommerce/payment-service:latest
    build:
      context: ./payment-service
      dockerfile: Dockerfile
    depends_on:
      - postgres
      - kafka
      - eureka
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/payments
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka:8761/eureka/
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:29092
    ports:
      - "8085:8080"
    networks:
      - ecommerce-network

  notification-service:
    image: ecommerce/notification-service:latest
    build:
      context: ./notification-service
      dockerfile: Dockerfile
    depends_on:
      - kafka
      - eureka
    environment:
      SPRING_PROFILES_ACTIVE: dev
      EUREKA_CLIENT_SERVICEURL_DEFAULTZONE: http://eureka:8761/eureka/
      SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:29092
    ports:
      - "8086:8080"
    networks:
      - ecommerce-network

volumes:
  postgres-data:
  kong-db-data:
  elasticsearch-data:

networks:
  ecommerce-network:
    driver: bridge

```

### 8.2 Docker Image Build Guidelines

- Use multi-stage builds for smaller images:

  ```dockerfile
  # Build stageFROM maven:3.8.6-openjdk-17 AS buildWORKDIR /appCOPY pom.xml .RUN mvn dependency:go-offlineCOPY src ./srcRUN mvn package -DskipTests# Runtime stageFROM eclipse-temurin:17-jreWORKDIR /appCOPY --from=build /app/target/*.jar app.jarENTRYPOINT ["java", "-jar", "app.jar"]
  ```

### 8.3 Environment-Specific Configuration

- Use Spring Boot profiles:
  - `application-dev.yml` - Local development settings
  - `application-test.yml` - Testing environment settings
  - `application-prod.yml` - Production settings
- Externalize sensitive configuration via environment variables

### 8.4 CI/CD Pipeline

```yaml
name: Build and Deploy Microservice

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build:
    runs-on: ubuntu-latest
  
    steps:
    - uses: actions/checkout@v3
  
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: maven
  
    - name: Build with Maven
      run: mvn -B package --file pom.xml
  
    - name: Run tests
      run: mvn test
  
    - name: Generate JaCoCo report
      run: mvn jacoco:report
  
    - name: Check test coverage
      run: |
        COVERAGE=$(grep -oP 'Total.*?([0-9]{1,3})%' target/site/jacoco/index.html | grep -oP '[0-9]{1,3}')
        if (( $COVERAGE < 80 )); then
          echo "Test coverage is below 80% (Current: $COVERAGE%)"
          exit 1
        fi
  
    - name: Build Docker image
      if: github.event_name != 'pull_request'
      run: |
        docker build -t ecommerce/${{ github.event.repository.name }}:latest .
        docker tag ecommerce/${{ github.event.repository.name }}:latest ecommerce/${{ github.event.
```
