-- Sample data matching the current homepage. Placeholder prices and
-- image paths: replace once real images are in public/images/.
-- Safe to delete this file once real products are being added.

INSERT INTO categories (name) VALUES
  ('Fruits'),
  ('Vegetables & Mushrooms'),
  ('Proteins'),
  ('Bakery'),
  ('Dairy');

INSERT INTO products (name, category_id, description, price, image_path) VALUES
  ('Organic Apples',
   (SELECT category_id FROM categories WHERE name = 'Fruits'),
   'Crisp organic apples, sold per pound.', 2.49, '/images/organic-apples.jpg'),
  ('Tomato',
   (SELECT category_id FROM categories WHERE name = 'Vegetables & Mushrooms'),
   'Vine-ripened tomatoes, sold per pound.', 1.99, '/images/tomato.jpg'),
  ('Free-Range Eggs',
   (SELECT category_id FROM categories WHERE name = 'Proteins'),
   'One dozen free-range eggs.', 4.99, '/images/free-range-eggs.jpg'),
  ('Whole Wheat Bread',
   (SELECT category_id FROM categories WHERE name = 'Bakery'),
   'Sliced whole wheat loaf.', 3.99, '/images/whole-wheat-bread.jpg'),
  ('Cheddar Cheese',
   (SELECT category_id FROM categories WHERE name = 'Dairy'),
   'Sharp cheddar, 8 oz block.', 5.49, '/images/cheddar-cheese.jpg');
