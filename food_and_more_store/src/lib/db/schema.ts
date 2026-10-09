import { pgTable, unique, integer, varchar, index, foreignKey, check, text, numeric, boolean, char, date, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const categories = pgTable("categories", {
	categoryId: integer("category_id").primaryKey().generatedAlwaysAsIdentity({ name: "categories_category_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 50 }).notNull(),
}, (table) => [
	unique("categories_name_key").on(table.name),
]);

export const products = pgTable("products", {
	productId: integer("product_id").primaryKey().generatedAlwaysAsIdentity({ name: "products_product_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 100 }).notNull(),
	categoryId: integer("category_id").notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	imagePath: varchar("image_path", { length: 255 }),
	isAgeRestricted: boolean("is_age_restricted").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
}, (table) => [
	index("idx_products_category").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.categoryId],
			name: "products_category_id_fkey"
		}),
	check("products_price_check", sql`price >= (0)::numeric`),
]);

export const customers = pgTable("customers", {
	customerId: integer("customer_id").primaryKey().generatedAlwaysAsIdentity({ name: "customers_customer_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 100 }).notNull(),
	address: varchar({ length: 150 }),
	city: varchar({ length: 60 }),
	state: char({ length: 2 }),
	zip: varchar({ length: 10 }),
	dateOfBirth: date("date_of_birth"),
	email: varchar({ length: 100 }).notNull(),
	phone: varchar({ length: 15 }),
}, (table) => [
	unique("customers_email_key").on(table.email),
	check("customers_date_of_birth_check", sql`date_of_birth <= CURRENT_DATE`),
]);

export const orders = pgTable("orders", {
	orderId: integer("order_id").primaryKey().generatedAlwaysAsIdentity({ name: "orders_order_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	customerId: integer("customer_id").notNull(),
	orderedAt: timestamp("ordered_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	orderAddress: varchar("order_address", { length: 255 }).notNull(),
}, (table) => [
	index("idx_orders_customer").using("btree", table.customerId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.customerId],
			name: "orders_customer_id_fkey"
		}),
	check("orders_status_check", sql`(status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'shipped'::character varying, 'delivered'::character varying, 'cancelled'::character varying])::text[])`),
]);

export const orderItems = pgTable("order_items", {
	orderItemId: integer("order_item_id").primaryKey().generatedAlwaysAsIdentity({ name: "order_items_order_item_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	orderId: integer("order_id").notNull(),
	productId: integer("product_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
}, (table) => [
	index("idx_order_items_product").using("btree", table.productId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.orderId],
			name: "order_items_order_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.productId],
			name: "order_items_product_id_fkey"
		}),
	unique("order_items_order_id_product_id_key").on(table.orderId, table.productId),
	check("order_items_quantity_check", sql`quantity > 0`),
	check("order_items_unit_price_check", sql`unit_price >= (0)::numeric`),
]);
