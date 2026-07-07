-- =============================================================================
-- 0006_seed_family_hub_catalog.sql
-- Idéntico al catálogo de las migraciones históricas 0004, aplicado ahora
-- sobre family_hub.* dentro del proyecto human. Ver knowledge/ para la
-- fuente de verdad de este contenido.
-- =============================================================================

insert into family_hub.allergens (slug, name, source_id) values
  ('gluten_cereals', 'Cereales que contienen gluten (trigo, centeno, cebada, avena, espelta, kamut)', 'efsa-reglamento-1169-2011'),
  ('crustaceans', 'Crustáceos', 'efsa-reglamento-1169-2011'),
  ('eggs', 'Huevos', 'efsa-reglamento-1169-2011'),
  ('fish', 'Pescado', 'efsa-reglamento-1169-2011'),
  ('peanuts', 'Cacahuetes', 'efsa-reglamento-1169-2011'),
  ('soybeans', 'Soja', 'efsa-reglamento-1169-2011'),
  ('milk', 'Leche y derivados (incluida lactosa)', 'efsa-reglamento-1169-2011'),
  ('tree_nuts', 'Frutos de cáscara (almendra, avellana, nuez, anacardo, pistacho...)', 'efsa-reglamento-1169-2011'),
  ('celery', 'Apio', 'efsa-reglamento-1169-2011'),
  ('mustard', 'Mostaza', 'efsa-reglamento-1169-2011'),
  ('sesame', 'Granos de sésamo', 'efsa-reglamento-1169-2011'),
  ('sulphites', 'Dióxido de azufre y sulfitos (>10 mg/kg)', 'efsa-reglamento-1169-2011'),
  ('lupin', 'Altramuces', 'efsa-reglamento-1169-2011'),
  ('molluscs', 'Moluscos', 'efsa-reglamento-1169-2011');

insert into family_hub.food_items (name, category, min_age_days, source_id) values
  ('Puré de plátano', 'fruta', 180, 'aep-espghan-oms-2024'),
  ('Puré de manzana', 'fruta', 180, 'aep-espghan-oms-2024'),
  ('Puré de pera', 'fruta', 180, 'aep-espghan-oms-2024'),
  ('Puré de melocotón', 'fruta', 180, 'aep-espghan-oms-2024'),
  ('Aguacate', 'fruta', 180, 'aep-espghan-oms-2024'),
  ('Puré de calabacín', 'verdura', 180, 'aep-espghan-oms-2024'),
  ('Puré de zanahoria', 'verdura', 180, 'aep-espghan-oms-2024'),
  ('Puré de patata', 'verdura', 180, 'aep-espghan-oms-2024'),
  ('Puré de guisantes', 'verdura', 180, 'aep-espghan-oms-2024'),
  ('Puré de boniato', 'verdura', 180, 'aep-espghan-oms-2024'),
  ('Pollo cocido triturado', 'proteína', 180, 'aep-espghan-oms-2024'),
  ('Pescado blanco cocido triturado', 'proteína', 180, 'aep-espghan-oms-2024'),
  ('Huevo cocido', 'proteína', 180, 'aep-espghan-oms-2024'),
  ('Crema de cacahuete diluida', 'proteína', 180, 'aep-espghan-oms-2024'),
  ('Lentejas cocidas y trituradas', 'legumbre', 180, 'aep-espghan-oms-2024'),
  ('Cereales sin gluten', 'cereal', 180, 'aep-espghan-oms-2024'),
  ('Crema de arroz', 'cereal', 180, 'aep-espghan-oms-2024'),
  ('Pan / cereales con gluten', 'cereal', 180, 'aep-espghan-oms-2024'),
  ('Yogur natural sin azucarar', 'lácteo', 180, 'aep-espghan-oms-2024'),
  ('Queso fresco tipo tierno', 'lácteo', 180, 'aep-espghan-oms-2024');

insert into family_hub.food_allergens (food_item_id, allergen_id)
select f.id, a.id from family_hub.food_items f, family_hub.allergens a
where (f.name = 'Pescado blanco cocido triturado' and a.slug = 'fish')
   or (f.name = 'Huevo cocido' and a.slug = 'eggs')
   or (f.name = 'Crema de cacahuete diluida' and a.slug = 'peanuts')
   or (f.name = 'Pan / cereales con gluten' and a.slug = 'gluten_cereals')
   or (f.name = 'Yogur natural sin azucarar' and a.slug = 'milk')
   or (f.name = 'Queso fresco tipo tierno' and a.slug = 'milk');
