-- User Service Table
create table users (
                       id bigint primary key generated always as identity,
                       username text unique not null,
                       email text unique not null,
                       password_hash text not null,
                       created_at timestamptz default now(),
                       updated_at timestamptz default now()
);

-- Product Catalog Service Table
create table products (
                          id bigint primary key generated always as identity,
                          name text not null,
                          description text,
                          price numeric(10, 2) not null,
                          category text,
                          inventory_count int not null,
                          created_at timestamptz default now(),
                          updated_at timestamptz default now()
);

-- Shopping Cart Service Table
create table shopping_carts (
                                id bigint primary key generated always as identity,
                                user_id bigint references users (id),
                                created_at timestamptz default now(),
                                updated_at timestamptz default now()
);

create table cart_items (
                            id bigint primary key generated always as identity,
                            cart_id bigint references shopping_carts (id),
                            product_id bigint references products (id),
                            quantity int not null,
                            created_at timestamptz default now(),
                            updated_at timestamptz default now()
);

-- Order Service Table
create table orders (
                        id bigint primary key generated always as identity,
                        user_id bigint references users (id),
                        total_amount numeric(10, 2) not null,
                        status text not null,
                        created_at timestamptz default now(),
                        updated_at timestamptz default now()
);

create table order_items (
                             id bigint primary key generated always as identity,
                             order_id bigint references orders (id),
                             product_id bigint references products (id),
                             quantity int not null,
                             price numeric(10, 2) not null,
                             created_at timestamptz default now(),
                             updated_at timestamptz default now()
);

-- Payment Service Table
create table payments (
                          id bigint primary key generated always as identity,
                          order_id bigint references orders (id),
                          amount numeric(10, 2) not null,
                          payment_method text not null,
                          payment_status text not null,
                          created_at timestamptz default now(),
                          updated_at timestamptz default now()
);

-- Notification Service Table
create table notifications (
                               id bigint primary key generated always as identity,
                               user_id bigint references users (id),
                               message text not null,
                               notification_type text not null,
                               sent_at timestamptz default now()
);