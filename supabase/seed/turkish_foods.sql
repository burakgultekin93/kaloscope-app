-- 002_turkish_foods_seed.sql

INSERT INTO food_items (name_tr, name_en, category, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, is_turkish, is_verified, serving_sizes) VALUES

-- Kahvaltılıklar
('Menemen', 'Turkish Scrambled Eggs with Tomato', 'breakfast', 120, 7.5, 5.2, 8.1, 1.2, true, true,
 '[{"label":"1 porsiyon","grams":200},{"label":"Büyük porsiyon","grams":300}]'),

('Simit', 'Turkish Sesame Bagel', 'bread_pastry', 310, 9.5, 55.0, 5.8, 2.5, true, true,
 '[{"label":"1 adet","grams":120},{"label":"Yarım","grams":60}]'),

('Sucuklu Yumurta', 'Eggs with Turkish Sausage', 'breakfast', 195, 14.0, 1.5, 15.0, 0, true, true,
 '[{"label":"1 porsiyon (2 yumurta)","grams":180}]'),

-- Ana Yemekler
('Karnıyarık', 'Stuffed Eggplant', 'turkish_traditional', 145, 6.5, 8.0, 10.0, 3.5, true, true,
 '[{"label":"1 adet","grams":250},{"label":"2 adet","grams":500}]'),

('İskender Kebap', 'İskender Kebab', 'meat', 210, 15.0, 12.0, 12.5, 0.8, true, true,
 '[{"label":"1 porsiyon","grams":350},{"label":"Yarım porsiyon","grams":200}]'),

('Lahmacun', 'Turkish Pizza', 'turkish_traditional', 235, 10.0, 28.0, 9.5, 2.0, true, true,
 '[{"label":"1 adet","grams":180},{"label":"2 adet","grams":360}]'),

('Mantı', 'Turkish Dumplings', 'turkish_traditional', 195, 9.0, 22.0, 8.0, 1.5, true, true,
 '[{"label":"1 porsiyon","grams":300}]'),

('Kuru Fasulye', 'Turkish White Bean Stew', 'legume', 95, 6.0, 14.0, 1.5, 5.0, true, true,
 '[{"label":"1 porsiyon","grams":250},{"label":"Pilavlı","grams":400}]'),

('Mercimek Çorbası', 'Red Lentil Soup', 'soup', 65, 4.0, 9.5, 1.5, 2.5, true, true,
 '[{"label":"1 kase","grams":250},{"label":"Büyük kase","grams":350}]'),

('Döner (Tavuk)', 'Chicken Döner', 'chicken', 180, 22.0, 2.0, 9.0, 0.5, true, true,
 '[{"label":"Dürüm","grams":250},{"label":"Porsiyon","grams":200}]'),

('Döner (Et)', 'Beef/Lamb Döner', 'meat', 220, 18.0, 2.5, 15.0, 0.5, true, true,
 '[{"label":"Dürüm","grams":250},{"label":"Porsiyon","grams":200}]'),

('Pide (Kıymalı)', 'Turkish Flatbread with Ground Meat', 'turkish_traditional', 240, 11.0, 26.0, 10.0, 1.5, true, true,
 '[{"label":"1 dilim","grams":150},{"label":"Tam pide","grams":450}]'),

('İmam Bayıldı', 'Stuffed Eggplant (Olive Oil)', 'vegetable', 110, 2.0, 8.5, 8.0, 3.0, true, true,
 '[{"label":"1 adet","grams":200}]'),

('Hünkar Beğendi', 'Sultan\'s Delight', 'meat', 175, 12.0, 10.0, 10.5, 1.5, true, true,
 '[{"label":"1 porsiyon","grams":300}]'),

-- Tatlılar
('Baklava', 'Baklava', 'dessert', 430, 6.0, 45.0, 26.0, 2.0, true, true,
 '[{"label":"1 dilim","grams":60},{"label":"2 dilim","grams":120}]'),

('Künefe', 'Künefe', 'dessert', 350, 7.0, 38.0, 19.0, 0.5, true, true,
 '[{"label":"1 porsiyon","grams":150}]'),

('Sütlaç', 'Turkish Rice Pudding', 'dessert', 130, 3.5, 22.0, 3.0, 0.2, true, true,
 '[{"label":"1 kase","grams":200}]'),

-- İçecekler
('Ayran', 'Ayran (Yogurt Drink)', 'beverage', 35, 1.7, 2.5, 1.8, 0, true, true,
 '[{"label":"1 bardak","grams":200},{"label":"Büyük","grams":330}]'),

('Türk Kahvesi', 'Turkish Coffee', 'beverage', 2, 0.1, 0.3, 0, 0, true, true,
 '[{"label":"1 fincan","grams":60},{"label":"Şekerli","grams":60}]'),

('Çay (Şekersiz)', 'Turkish Tea (No Sugar)', 'beverage', 1, 0, 0.2, 0, 0, true, true,
 '[{"label":"1 bardak","grams":100},{"label":"2 şekerli","grams":100}]');
