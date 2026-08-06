ALTER TABLE public.registros_ecu
  ADD COLUMN IF NOT EXISTS marca_vehiculo text,
  ADD COLUMN IF NOT EXISTS modelo_vehiculo text,
  ADD COLUMN IF NOT EXISTS anio_vehiculo integer;