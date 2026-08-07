-- Add editable descriptions to weekly menus. Day comments stay in the existing JSONB days document.

ALTER TABLE weekly_menus
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
