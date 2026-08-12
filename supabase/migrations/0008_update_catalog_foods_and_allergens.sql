-- =============================================================================
-- 0008_update_catalog_foods_and_allergens.sql
-- Actualiza y expande el catálogo completo de alimentos y alérgenos según la
-- nueva lista estructurada por categorías facilitada por el usuario.
-- =============================================================================

-- 1. Actualizar nombres existentes para que coincidan con la nueva lista limpia
UPDATE family_hub.food_items SET name = 'Plátano' WHERE name IN ('Puré de plátano');
UPDATE family_hub.food_items SET name = 'Manzana' WHERE name IN ('Puré de manzana');
UPDATE family_hub.food_items SET name = 'Pera' WHERE name IN ('Puré de pera');
UPDATE family_hub.food_items SET name = 'Melocotón' WHERE name IN ('Puré de melocotón');
UPDATE family_hub.food_items SET name = 'Calabacín' WHERE name IN ('Puré de calabacín');
UPDATE family_hub.food_items SET name = 'Zanahoria' WHERE name IN ('Puré de zanahoria');
UPDATE family_hub.food_items SET name = 'Patata' WHERE name IN ('Puré de patata');
UPDATE family_hub.food_items SET name = 'Guisantes' WHERE name IN ('Puré de guisantes');
UPDATE family_hub.food_items SET name = 'Boniato' WHERE name IN ('Puré de boniato');
UPDATE family_hub.food_items SET name = 'Pollo' WHERE name IN ('Pollo cocido triturado');
UPDATE family_hub.food_items SET name = 'Merluza' WHERE name IN ('Pescado blanco cocido triturado');
UPDATE family_hub.food_items SET name = 'Huevo completo' WHERE name IN ('Huevo cocido');
UPDATE family_hub.food_items SET name = 'Crema de cacahuete' WHERE name IN ('Crema de cacahuete diluida');
UPDATE family_hub.food_items SET name = 'Lentejas' WHERE name IN ('Lentejas cocidas y trituradas');
UPDATE family_hub.food_items SET name = 'Pan' WHERE name IN ('Pan / cereales con gluten');
UPDATE family_hub.food_items SET name = 'Yogur natural' WHERE name IN ('Yogur natural sin azucarar');
UPDATE family_hub.food_items SET name = 'Queso fresco' WHERE name IN ('Queso fresco tipo tierno');
UPDATE family_hub.food_items SET name = 'Melón' WHERE name IN ('Melón Cantalou', 'Melón en dados');
UPDATE family_hub.food_items SET name = 'Ternera' WHERE name IN ('Ternera picada');

-- 2. Insertar alimentos faltantes evitando duplicados mediante ON CONFLICT DO NOTHING
INSERT INTO family_hub.food_items (name, category, min_age_days, source_id) VALUES
  -- FRUTAS
  ('Manzana', 'fruta', 180, 'aep-2024'),
  ('Pera', 'fruta', 180, 'aep-2024'),
  ('Plátano', 'fruta', 180, 'aep-2024'),
  ('Naranja', 'fruta', 180, 'aep-2024'),
  ('Mandarina', 'fruta', 180, 'aep-2024'),
  ('Clementina', 'fruta', 180, 'aep-2024'),
  ('Limón', 'fruta', 180, 'aep-2024'),
  ('Melocotón', 'fruta', 180, 'aep-2024'),
  ('Nectarina', 'fruta', 180, 'aep-2024'),
  ('Paraguayo', 'fruta', 180, 'aep-2024'),
  ('Albaricoque', 'fruta', 180, 'aep-2024'),
  ('Ciruela', 'fruta', 180, 'aep-2024'),
  ('Cereza', 'fruta', 180, 'aep-2024'),
  ('Fresa', 'fruta', 180, 'aep-2024'),
  ('Frambuesa', 'fruta', 180, 'aep-2024'),
  ('Mora', 'fruta', 180, 'aep-2024'),
  ('Arándano', 'fruta', 180, 'aep-2024'),
  ('Uva', 'fruta', 180, 'aep-2024'),
  ('Mango', 'fruta', 180, 'aep-2024'),
  ('Papaya', 'fruta', 180, 'aep-2024'),
  ('Piña', 'fruta', 180, 'aep-2024'),
  ('Melón', 'fruta', 180, 'aep-2024'),
  ('Sandía', 'fruta', 180, 'aep-2024'),
  ('Kiwi', 'fruta', 180, 'aep-2024'),
  ('Higo', 'fruta', 180, 'aep-2024'),
  ('Caqui', 'fruta', 180, 'aep-2024'),
  ('Granada', 'fruta', 180, 'aep-2024'),
  ('Chirimoya', 'fruta', 180, 'aep-2024'),
  ('Aguacate', 'fruta', 180, 'aep-2024'),
  ('Coco', 'fruta', 180, 'aep-2024'),

  -- VERDURAS Y HORTALIZAS
  ('Patata', 'verdura', 180, 'aep-2024'),
  ('Boniato', 'verdura', 180, 'aep-2024'),
  ('Zanahoria', 'verdura', 180, 'aep-2024'),
  ('Calabacín', 'verdura', 180, 'aep-2024'),
  ('Calabaza', 'verdura', 180, 'aep-2024'),
  ('Berenjena', 'verdura', 180, 'aep-2024'),
  ('Tomate', 'verdura', 180, 'aep-2024'),
  ('Pimiento rojo', 'verdura', 180, 'aep-2024'),
  ('Pimiento verde', 'verdura', 180, 'aep-2024'),
  ('Pimiento amarillo', 'verdura', 180, 'aep-2024'),
  ('Cebolla', 'verdura', 180, 'aep-2024'),
  ('Puerro', 'verdura', 180, 'aep-2024'),
  ('Ajo', 'verdura', 180, 'aep-2024'),
  ('Brócoli', 'verdura', 180, 'aep-2024'),
  ('Coliflor', 'verdura', 180, 'aep-2024'),
  ('Judía verde', 'verdura', 180, 'aep-2024'),
  ('Guisantes', 'verdura', 180, 'aep-2024'),
  ('Espinacas', 'verdura', 365, 'aep-2024'),
  ('Acelgas', 'verdura', 365, 'aep-2024'),
  ('Lechuga', 'verdura', 180, 'aep-2024'),
  ('Pepino', 'verdura', 180, 'aep-2024'),
  ('Alcachofa', 'verdura', 180, 'aep-2024'),
  ('Espárragos', 'verdura', 180, 'aep-2024'),
  ('Apio', 'verdura', 180, 'aep-2024'),
  ('Remolacha', 'verdura', 180, 'aep-2024'),
  ('Nabo', 'verdura', 180, 'aep-2024'),
  ('Chirivía', 'verdura', 180, 'aep-2024'),
  ('Col', 'verdura', 180, 'aep-2024'),
  ('Repollo', 'verdura', 180, 'aep-2024'),
  ('Lombarda', 'verdura', 180, 'aep-2024'),
  ('Coles de Bruselas', 'verdura', 180, 'aep-2024'),
  ('Maíz', 'verdura', 180, 'aep-2024'),

  -- CEREALES
  ('Arroz', 'cereal', 180, 'aep-2024'),
  ('Avena', 'cereal', 180, 'aep-2024'),
  ('Trigo', 'cereal', 180, 'aep-2024'),
  ('Espelta', 'cereal', 180, 'aep-2024'),
  ('Cebada', 'cereal', 180, 'aep-2024'),
  ('Centeno', 'cereal', 180, 'aep-2024'),
  ('Trigo sarraceno', 'cereal', 180, 'aep-2024'),
  ('Quinoa', 'cereal', 180, 'aep-2024'),
  ('Mijo', 'cereal', 180, 'aep-2024'),
  ('Amaranto', 'cereal', 180, 'aep-2024'),
  ('Pan', 'cereal', 180, 'aep-2024'),
  ('Pasta', 'cereal', 180, 'aep-2024'),
  ('Cuscús', 'cereal', 180, 'aep-2024'),
  ('Bulgur', 'cereal', 180, 'aep-2024'),

  -- LEGUMBRES
  ('Lentejas', 'legumbre', 180, 'aep-2024'),
  ('Garbanzos', 'legumbre', 180, 'aep-2024'),
  ('Judías blancas', 'legumbre', 180, 'aep-2024'),
  ('Judías pintas', 'legumbre', 180, 'aep-2024'),
  ('Judías rojas', 'legumbre', 180, 'aep-2024'),
  ('Judías negras', 'legumbre', 180, 'aep-2024'),
  ('Soja', 'legumbre', 180, 'aep-2024'),
  ('Edamame', 'legumbre', 180, 'aep-2024'),
  ('Habas', 'legumbre', 180, 'aep-2024'),

  -- CARNES, PESCADOS, MARISCOS Y HUEVOS
  ('Pollo', 'proteína', 180, 'aep-2024'),
  ('Pavo', 'proteína', 180, 'aep-2024'),
  ('Conejo', 'proteína', 180, 'aep-2024'),
  ('Ternera', 'proteína', 180, 'aep-2024'),
  ('Cerdo', 'proteína', 180, 'aep-2024'),
  ('Cordero', 'proteína', 180, 'aep-2024'),
  ('Cabrito', 'proteína', 180, 'aep-2024'),
  ('Hígado de pollo', 'proteína', 180, 'aep-2024'),
  ('Hígado de ternera', 'proteína', 180, 'aep-2024'),

  ('Merluza', 'proteína', 180, 'aep-2024'),
  ('Bacalao', 'proteína', 180, 'aep-2024'),
  ('Pescadilla', 'proteína', 180, 'aep-2024'),
  ('Lenguado', 'proteína', 180, 'aep-2024'),
  ('Gallo', 'proteína', 180, 'aep-2024'),
  ('Lubina', 'proteína', 180, 'aep-2024'),
  ('Dorada', 'proteína', 180, 'aep-2024'),
  ('Rape', 'proteína', 180, 'aep-2024'),
  ('Salmón', 'proteína', 180, 'aep-2024'),
  ('Sardina', 'proteína', 180, 'aep-2024'),
  ('Boquerón', 'proteína', 180, 'aep-2024'),
  ('Caballa', 'proteína', 180, 'aep-2024'),
  ('Trucha', 'proteína', 180, 'aep-2024'),
  ('Atún', 'proteína', 180, 'aep-2024'),
  ('Bonito', 'proteína', 180, 'aep-2024'),
  ('Jurel', 'proteína', 180, 'aep-2024'),
  ('Corvina', 'proteína', 180, 'aep-2024'),
  ('Cabracho', 'proteína', 180, 'aep-2024'),

  ('Gamba', 'proteína', 180, 'aep-2024'),
  ('Langostino', 'proteína', 180, 'aep-2024'),
  ('Camarón', 'proteína', 180, 'aep-2024'),
  ('Carabinero', 'proteína', 180, 'aep-2024'),
  ('Cigala', 'proteína', 180, 'aep-2024'),
  ('Cangrejo', 'proteína', 180, 'aep-2024'),
  ('Bogavante', 'proteína', 180, 'aep-2024'),
  ('Centollo', 'proteína', 180, 'aep-2024'),
  ('Mejillón', 'proteína', 180, 'aep-2024'),
  ('Almeja', 'proteína', 180, 'aep-2024'),
  ('Berberecho', 'proteína', 180, 'aep-2024'),
  ('Navaja', 'proteína', 180, 'aep-2024'),
  ('Calamar', 'proteína', 180, 'aep-2024'),
  ('Sepia', 'proteína', 180, 'aep-2024'),
  ('Pulpo', 'proteína', 180, 'aep-2024'),

  ('Huevo de gallina', 'proteína', 180, 'aep-2024'),
  ('Yema de huevo', 'proteína', 180, 'aep-2024'),
  ('Clara de huevo', 'proteína', 180, 'aep-2024'),
  ('Huevo completo', 'proteína', 180, 'aep-2024'),

  -- LÁCTEOS
  ('Yogur natural', 'lácteo', 180, 'aep-2024'),
  ('Queso fresco', 'lácteo', 180, 'aep-2024'),
  ('Queso tierno', 'lácteo', 180, 'aep-2024'),
  ('Queso curado', 'lácteo', 365, 'aep-2024'),
  ('Requesón', 'lácteo', 180, 'aep-2024'),
  ('Kéfir', 'lácteo', 180, 'aep-2024'),
  ('Leche de vaca', 'lácteo', 365, 'aep-2024'),
  ('Mantequilla', 'lácteo', 180, 'aep-2024'),

  -- FRUTOS SECOS
  ('Almendra', 'frutos_secos', 180, 'aep-2024'),
  ('Avellana', 'frutos_secos', 180, 'aep-2024'),
  ('Nuez', 'frutos_secos', 180, 'aep-2024'),
  ('Anacardo', 'frutos_secos', 180, 'aep-2024'),
  ('Pistacho', 'frutos_secos', 180, 'aep-2024'),
  ('Nuez pecana', 'frutos_secos', 180, 'aep-2024'),
  ('Nuez de macadamia', 'frutos_secos', 180, 'aep-2024'),
  ('Nuez de Brasil', 'frutos_secos', 180, 'aep-2024'),
  ('Piñón', 'frutos_secos', 180, 'aep-2024'),

  -- SEMILLAS
  ('Sésamo', 'semillas', 180, 'aep-2024'),
  ('Chía', 'semillas', 180, 'aep-2024'),
  ('Lino', 'semillas', 180, 'aep-2024'),
  ('Semillas de girasol', 'semillas', 180, 'aep-2024'),
  ('Semillas de calabaza', 'semillas', 180, 'aep-2024'),
  ('Amapola', 'semillas', 180, 'aep-2024'),

  -- OTROS
  ('Aceite de oliva virgen extra', 'otro', 180, 'aep-2024'),
  ('Tahini', 'otro', 180, 'aep-2024'),
  ('Crema de cacahuete', 'otro', 180, 'aep-2024'),
  ('Crema de almendra', 'otro', 180, 'aep-2024'),
  ('Crema de avellana', 'otro', 180, 'aep-2024'),
  ('Tofu', 'otro', 180, 'aep-2024')
ON CONFLICT (family_id, name) DO NOTHING;

-- 3. Vincular todos los alimentos con sus alérgenos oficiales EFSA
INSERT INTO family_hub.food_allergens (food_item_id, allergen_id)
SELECT f.id, a.id 
FROM family_hub.food_items f, family_hub.allergens a
WHERE f.family_id IS NULL AND (
  -- Gluten
  (f.name IN ('Avena', 'Trigo', 'Espelta', 'Cebada', 'Centeno', 'Pan', 'Pasta', 'Cuscús', 'Bulgur') AND a.slug = 'gluten_cereals') OR
  -- Crustáceos
  (f.name IN ('Gamba', 'Langostino', 'Camarón', 'Carabinero', 'Cigala', 'Cangrejo', 'Bogavante', 'Centollo') AND a.slug = 'crustaceans') OR
  -- Moluscos
  (f.name IN ('Mejillón', 'Almeja', 'Berberecho', 'Navaja', 'Calamar', 'Sepia', 'Pulpo') AND a.slug = 'molluscs') OR
  -- Huevos
  (f.name IN ('Huevo de gallina', 'Yema de huevo', 'Clara de huevo', 'Huevo completo') AND a.slug = 'eggs') OR
  -- Pescado
  (f.name IN ('Merluza', 'Bacalao', 'Pescadilla', 'Lenguado', 'Gallo', 'Lubina', 'Dorada', 'Rape', 'Salmón', 'Sardina', 'Boquerón', 'Caballa', 'Trucha', 'Atún', 'Bonito', 'Jurel', 'Corvina', 'Cabracho') AND a.slug = 'fish') OR
  -- Cacahuetes
  (f.name IN ('Crema de cacahuete') AND a.slug = 'peanuts') OR
  -- Soja
  (f.name IN ('Soja', 'Edamame', 'Tofu') AND a.slug = 'soybeans') OR
  -- Leche
  (f.name IN ('Yogur natural', 'Queso fresco', 'Queso tierno', 'Queso curado', 'Requesón', 'Kéfir', 'Leche de vaca', 'Mantequilla') AND a.slug = 'milk') OR
  -- Frutos de cáscara
  (f.name IN ('Almendra', 'Avellana', 'Nuez', 'Anacardo', 'Pistacho', 'Nuez pecana', 'Nuez de macadamia', 'Nuez de Brasil', 'Piñón', 'Crema de almendra', 'Crema de avellana') AND a.slug = 'tree_nuts') OR
  -- Apio
  (f.name IN ('Apio') AND a.slug = 'celery') OR
  -- Sésamo
  (f.name IN ('Sésamo', 'Tahini') AND a.slug = 'sesame')
)
ON CONFLICT DO NOTHING;
