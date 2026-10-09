-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "categories" (
	"category_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_category_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(50) NOT NULL,
	CONSTRAINT "categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"product_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_product_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"category_id" integer NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"image_path" varchar(255),
	"is_age_restricted" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "products_price_check" CHECK (price >= (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"customer_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_customer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(100) NOT NULL,
	"address" varchar(150),
	"city" varchar(60),
	"state" char(2),
	"zip" varchar(10),
	"date_of_birth" date,
	"email" varchar(100) NOT NULL,
	"phone" varchar(15),
	CONSTRAINT "customers_email_key" UNIQUE("email"),
	CONSTRAINT "customers_date_of_birth_check" CHECK (date_of_birth <= CURRENT_DATE)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"order_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_order_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"customer_id" integer NOT NULL,
	"ordered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"order_address" varchar(255) NOT NULL,
	CONSTRAINT "orders_status_check" CHECK ((status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"order_item_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "order_items_order_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	CONSTRAINT "order_items_order_id_product_id_key" UNIQUE("order_id","product_id"),
	CONSTRAINT "order_items_quantity_check" CHECK (quantity > 0),
	CONSTRAINT "order_items_unit_price_check" CHECK (unit_price >= (0)::numeric)
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_category" ON "products" USING btree ("category_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_orders_customer" ON "orders" USING btree ("customer_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_order_items_product" ON "order_items" USING btree ("product_id" int4_ops);
*/