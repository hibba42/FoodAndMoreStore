import { relations } from "drizzle-orm/relations";
import { user, session, account, customers, categories, products, orders, orderItems } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	customers: many(customers),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const customersRelations = relations(customers, ({one, many}) => ({
	user: one(user, {
		fields: [customers.authUserId],
		references: [user.id]
	}),
	orders: many(orders),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.categoryId]
	}),
	orderItems: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	customer: one(customers, {
		fields: [orders.customerId],
		references: [customers.customerId]
	}),
	orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.orderId]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.productId]
	}),
}));