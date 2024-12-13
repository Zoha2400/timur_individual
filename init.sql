-- Таблица для администраторов
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Таблица для сотрудников магазина
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    hire_date DATE NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary NUMERIC(10, 2) NOT NULL
);

-- Таблица для товаров
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    texture VARCHAR(255) NOT NULL,
    color VARCHAR(100) NOT NULL,
    price_per_sqm NUMERIC(10, 2) NOT NULL,
    sqm_per_package NUMERIC(10, 2) NOT NULL,
    package_weight NUMERIC(10, 2) NOT NULL,
    tile_size VARCHAR(100) NOT NULL,
    total_price NUMERIC(10, 2) GENERATED ALWAYS AS (price_per_sqm * sqm_per_package) STORED
);

-- Таблица для клиентов
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    total_orders INT DEFAULT 0
);

-- Таблица для заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_details TEXT NOT NULL,
    client_id INT REFERENCES clients(id) ON DELETE CASCADE,
    size_sqm NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL
);
