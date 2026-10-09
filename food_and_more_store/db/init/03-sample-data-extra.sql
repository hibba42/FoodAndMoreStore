-- Extra sample products so the database-driven homepage looks like the old
-- hardcoded one. Placeholder prices and image paths; delete when real data exists.

INSERT INTO products (name, category_id, description, price, image_path) VALUES
  ('Dragonfruit',  (SELECT category_id FROM categories WHERE name = 'Fruits'), 'Fresh dragonfruit, each.', 5.99, '/images/dragonfruit.jpg'),
  ('Starfruit',    (SELECT category_id FROM categories WHERE name = 'Fruits'), 'Sweet-tart starfruit, each.', 2.99, '/images/starfruit.jpg'),
  ('Blackberries', (SELECT category_id FROM categories WHERE name = 'Fruits'), 'Fresh blackberries, 6 oz.', 4.49, '/images/blackberries.jpg'),
  ('Carrots',      (SELECT category_id FROM categories WHERE name = 'Vegetables & Mushrooms'), 'Whole carrots, 1 lb bag.', 1.79, '/images/carrots.jpg'),
  ('Leeks',        (SELECT category_id FROM categories WHERE name = 'Vegetables & Mushrooms'), 'Fresh leeks, bunch of 3.', 3.29, '/images/leeks.jpg'),
  ('Matsutake Mushrooms', (SELECT category_id FROM categories WHERE name = 'Vegetables & Mushrooms'), 'Prized matsutake mushrooms, 4 oz.', 19.99, '/images/matsutake.jpg'),
  ('Chicken Breast', (SELECT category_id FROM categories WHERE name = 'Proteins'), 'Boneless chicken breast, per pound.', 5.99, '/images/chicken-breast.jpg'),
  ('Salmon Fillet',  (SELECT category_id FROM categories WHERE name = 'Proteins'), 'Fresh salmon fillet, per pound.', 12.99, '/images/salmon-fillet.jpg'),
  ('Tofu',           (SELECT category_id FROM categories WHERE name = 'Proteins'), 'Firm tofu, 14 oz block.', 2.49, '/images/tofu.jpg');
