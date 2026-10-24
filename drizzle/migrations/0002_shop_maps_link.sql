ALTER TABLE public.settings ADD COLUMN maps_link text;
UPDATE public.settings SET maps_link = 'https://maps.app.goo.gl/JE4r246QNFvA5oed6' WHERE id = 1 AND maps_link IS NULL;