import { relations } from "drizzle-orm/relations";
import { categories, products, customers, orders, orderItems } from "./schema";

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

export const customersRelations = relations(customers, ({many}) => ({
	orders: many(orders),
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