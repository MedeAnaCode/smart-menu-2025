-- PlanDish v2: Keycloak identity linkage and normalized recipe ingredients.
-- This migration is additive; previously applied migrations are not edited.

ALTER TABLE users ADD COLUMN IF NOT EXISTS "keycloakId" VARCHAR(255);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'passwordHash'
  ) THEN
    ALTER TABLE users ALTER COLUMN "passwordHash" DROP NOT NULL;
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS users_keycloak_id_unique ON users ("keycloakId");

CREATE TABLE IF NOT EXISTS common_ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  "normalizedName" VARCHAR(255) NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id SERIAL PRIMARY KEY,
  "recipeId" INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  "commonIngredientId" INTEGER NULL REFERENCES common_ingredients(id) ON DELETE RESTRICT,
  "customName" VARCHAR(255) NULL,
  amount VARCHAR(255) NOT NULL,
  unit VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT recipe_ingredients_exactly_one_source CHECK (
    ("commonIngredientId" IS NOT NULL AND "customName" IS NULL)
    OR ("commonIngredientId" IS NULL AND "customName" IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_id ON recipe_ingredients ("recipeId");
CREATE INDEX IF NOT EXISTS recipe_ingredients_common_id ON recipe_ingredients ("commonIngredientId");

INSERT INTO common_ingredients (name, "normalizedName", "createdAt", "updatedAt")
SELECT DISTINCT TRIM(item->>'name'), LOWER(TRIM(item->>'name')), NOW(), NOW()
FROM recipes
CROSS JOIN LATERAL UNNEST(ingredients) AS item
WHERE COALESCE(TRIM(item->>'name'), '') <> ''
ON CONFLICT ("normalizedName") DO NOTHING;

INSERT INTO recipe_ingredients (
  "recipeId", "commonIngredientId", "customName", amount, unit, position, "createdAt", "updatedAt"
)
SELECT
  recipe.id,
  common_ingredient.id,
  NULL,
  COALESCE(item.value->>'amount', ''),
  COALESCE(item.value->>'um', ''),
  item.ordinality - 1,
  NOW(),
  NOW()
FROM recipes AS recipe
CROSS JOIN LATERAL UNNEST(recipe.ingredients) WITH ORDINALITY AS item(value, ordinality)
JOIN common_ingredients AS common_ingredient
  ON common_ingredient."normalizedName" = LOWER(TRIM(item.value->>'name'))
WHERE NOT EXISTS (
  SELECT 1 FROM recipe_ingredients existing WHERE existing."recipeId" = recipe.id
);
