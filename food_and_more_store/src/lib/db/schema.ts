import { pgTable, unique, text, boolean, timestamp, index, foreignKey, uniqueIndex, check, integer, varchar, char, date, numeric, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("user_email_key").on(table.email),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_fkey"
		}).onDelete("cascade"),
	unique("session_token_key").on(table.token),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_fkey"
		}).onDelete("cascade"),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
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
	authUserId: text("auth_user_id"),
}, (table) => [
	uniqueIndex("customers_guest_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")).where(sql`(auth_user_id IS NULL)`),
	foreignKey({
			columns: [table.authUserId],
			foreignColumns: [user.id],
			name: "customers_auth_user_id_fkey"
		}).onDelete("set null"),
	unique("customers_auth_user_id_key").on(table.authUserId),
	check("customers_date_of_birth_check", sql`date_of_birth <= CURRENT_DATE`),
]);

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

export const orders = pgTable("orders", {
	orderId: integer("order_id").primaryKey().generatedAlwaysAsIdentity({ name: "orders_order_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	publicToken: uuid("public_token").defaultRandom().notNull(),
	customerId: integer("customer_id").notNull(),
	orderedAt: timestamp("ordered_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	status: varchar({ length: 20 }).default('pending').notNull(),
	recipientName: varchar("recipient_name", { length: 100 }).notNull(),
	contactEmail: varchar("contact_email", { length: 100 }).notNull(),
	contactPhone: varchar("contact_phone", { length: 15 }),
	orderAddress: varchar("order_address", { length: 255 }).notNull(),
}, (table) => [
	index("idx_orders_customer").using("btree", table.customerId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.customerId],
			foreignColumns: [customers.customerId],
			name: "orders_customer_id_fkey"
		}),
	unique("orders_public_token_key").on(table.publicToken),
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
