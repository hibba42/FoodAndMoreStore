-- Food & More Store: initial database schema
-- Runs automatically ONCE, when the Postgres data volume is first created.

-- ---------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------
CREATE TABLE customers (
  customer_id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  address        VARCHAR(150),
  city           VARCHAR(60),
  state          CHAR(2),
  zip            VARCHAR(10),
  date_of_birth  DATE CHECK (date_of_birth <= CURRENT_DATE),
  email          VARCHAR(100) NOT NULL UNIQUE,
  phone          VARCHAR(15)
);

-- ---------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------
CREATE TABLE categories (
  category_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         VARCHAR(50) NOT NULL UNIQUE
);

-- ---------------------------------------------------------------
-- products
-- image_path is relative to Next.js's public/ folder,
-- e.g. '/images/tomato.jpg' (NOT '/public/images/tomato.jpg')
-- ---------------------------------------------------------------
CREATE TABLE products (
  product_id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name               VARCHAR(100) NOT NULL,
  category_id        INTEGER NOT NULL REFERENCES categories(category_id),
  description        TEXT,
  price              NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_path         VARCHAR(255),
  is_age_restricted  BOOLEAN NOT NULL DEFAULT FALSE,  -- alcohol/tobacco: require 21+
  is_active          BOOLEAN NOT NULL DEFAULT TRUE    -- hide instead of delete
);

CREATE INDEX idx_products_category ON products(category_id);

-- ---------------------------------------------------------------
-- orders (one row per order: the "receipt header")
-- order_address is a snapshot of the shipping address at checkout,
-- so later changes to the customer's address don't alter past orders.
-- ---------------------------------------------------------------
CREATE TABLE orders (
  order_id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id    INTEGER NOT NULL REFERENCES customers(customer_id),
  ordered_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  order_address  VARCHAR(255) NOT NULL
);

CREATE INDEX idx_orders_customer ON orders(customer_id);

-- ---------------------------------------------------------------
-- order_items (one row per product in an order: the "receipt lines")
-- unit_price is a snapshot of the price at purchase time.
-- ---------------------------------------------------------------
CREATE TABLE order_items (
  order_item_id  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id       INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id     INTEGER NOT NULL REFERENCES products(product_id),
  quantity       INTEGER NOT NULL CHECK (quantity > 0),
  unit_price     NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  UNIQUE (order_id, product_id)
);

CREATE INDEX idx_order_items_product ON order_items(product_id);
