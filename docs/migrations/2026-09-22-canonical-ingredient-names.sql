-- Rename the existing catalog in place: nominative singular, preserving IDs.
-- Natural plural product names (e.g. pasta and oat flakes) remain unchanged.
-- This is a one-time migration, not a runtime synonym dictionary.
-- runMigrations executes this file in a transaction, including the collision check.
CREATE TEMP TABLE canonical_ingredient_renames (
    old_name TEXT PRIMARY KEY,
    new_name TEXT NOT NULL
) ON COMMIT DROP;

INSERT INTO canonical_ingredient_renames (old_name, new_name) VALUES
    ('яйца', 'Яйцо'),
    ('огурцы', 'Огурец'),
    ('помидоры', 'Помидор'),
    ('томаты', 'Томат'),
    ('грибы', 'Гриб'),
    ('креветки', 'Креветка'),
    ('маслины', 'Маслина'),
    ('листья лайма', 'Лист лайма'),
    ('мед', 'Мёд'),
    ('розмарин сушёный', 'Сушёный розмарин');

DO $$
DECLARE
    conflicts TEXT;
BEGIN
    SELECT STRING_AGG(source.name || ' -> ' || mapping.new_name, ', ')
    INTO conflicts
    FROM common_ingredients AS source
    JOIN canonical_ingredient_renames AS mapping
      ON LOWER(TRIM(source.name)) = mapping.old_name
    JOIN common_ingredients AS target
      ON target."normalizedName" = LOWER(mapping.new_name)
     AND target.id <> source.id;

    IF conflicts IS NOT NULL THEN
        RAISE EXCEPTION 'Canonical ingredient names conflict with existing records: %. Resolve duplicate catalog records before retrying; no IDs have been merged.', conflicts;
    END IF;
END $$;

UPDATE common_ingredients AS ingredient
SET name = mapping.new_name,
    "normalizedName" = LOWER(mapping.new_name),
    "updatedAt" = NOW()
FROM canonical_ingredient_renames AS mapping
WHERE LOWER(TRIM(ingredient.name)) = mapping.old_name;

-- Recipe ingredient foreign keys remain valid because IDs are not changed.
-- Historical recipe/menu/shopping snapshots and private ingredient names are preserved.
