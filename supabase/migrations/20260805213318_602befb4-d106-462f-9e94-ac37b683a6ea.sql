-- ENUMS
CREATE TYPE public.app_role AS ENUM ('administrador','recepcion','tecnico','ventas');
CREATE TYPE public.estado_ecu AS ENUM (
  'recibida','en_prueba_simulador','pendiente_asignacion','asignada_tecnico',
  'en_revision','reparada','no_reparada','no_reparable','pendiente_entrega','completada'
);

-- PERFILES
CREATE TABLE public.perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT '',
  email TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.perfiles TO authenticated;
GRANT ALL ON public.perfiles TO service_role;
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfiles_select" ON public.perfiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "perfiles_update_own" ON public.perfiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- ROLES
CREATE TABLE public.roles_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  rol public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, rol)
);
GRANT SELECT ON public.roles_usuario TO authenticated;
GRANT ALL ON public.roles_usuario TO service_role;
ALTER TABLE public.roles_usuario ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _rol public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.roles_usuario WHERE user_id = _user_id AND rol = _rol);
$$;

CREATE POLICY "roles_select" ON public.roles_usuario FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_admin_all" ON public.roles_usuario FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'administrador')) WITH CHECK (public.has_role(auth.uid(),'administrador'));

-- Perfil automático al crear usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.roles_usuario (user_id, rol)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'rol')::public.app_role, 'recepcion'))
  ON CONFLICT (user_id, rol) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CLIENTES
CREATE SEQUENCE public.clientes_numero_seq START 1;
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_cliente TEXT NOT NULL UNIQUE DEFAULT ('CLI-' || lpad(nextval('public.clientes_numero_seq')::text, 4, '0')),
  nombre TEXT NOT NULL,
  empresa TEXT,
  telefono TEXT NOT NULL,
  email TEXT,
  direccion TEXT,
  municipio TEXT,
  observaciones TEXT,
  fecha_alta TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
GRANT USAGE ON SEQUENCE public.clientes_numero_seq TO authenticated, service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_select" ON public.clientes FOR SELECT TO authenticated USING (true);
CREATE POLICY "clientes_insert" ON public.clientes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clientes_update" ON public.clientes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "clientes_delete_admin" ON public.clientes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrador'));

-- MODELOS
CREATE TABLE public.modelos_ecu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  marca TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modelos_ecu TO authenticated;
GRANT ALL ON public.modelos_ecu TO service_role;
ALTER TABLE public.modelos_ecu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modelos_select" ON public.modelos_ecu FOR SELECT TO authenticated USING (true);
CREATE POLICY "modelos_insert" ON public.modelos_ecu FOR INSERT TO authenticated WITH CHECK (true);

-- REGISTROS ECU
CREATE SEQUENCE public.folio_seq START 1;
CREATE TABLE public.registros_ecu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio TEXT NOT NULL UNIQUE DEFAULT ('ECU-' || to_char(now(),'YYYY') || '-' || lpad(nextval('public.folio_seq')::text, 4, '0')),
  cliente_id UUID REFERENCES public.clientes ON DELETE SET NULL,
  modelo TEXT NOT NULL,
  anio INTEGER,
  numero_parte TEXT,
  motivo_visita TEXT,
  falla_reportada TEXT,
  observaciones TEXT,
  estado public.estado_ecu NOT NULL DEFAULT 'recibida',
  tecnico_id UUID REFERENCES auth.users ON DELETE SET NULL,
  fecha_asignacion TIMESTAMPTZ,
  fecha_ingreso TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_entrega TIMESTAMPTZ,
  recibido_por UUID REFERENCES auth.users ON DELETE SET NULL,
  para_venta BOOLEAN NOT NULL DEFAULT false,
  motivo_falla TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registros_ecu TO authenticated;
GRANT ALL ON public.registros_ecu TO service_role;
GRANT USAGE ON SEQUENCE public.folio_seq TO authenticated, service_role;
ALTER TABLE public.registros_ecu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "registros_select" ON public.registros_ecu FOR SELECT TO authenticated USING (true);
CREATE POLICY "registros_insert" ON public.registros_ecu FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "registros_update" ON public.registros_ecu FOR UPDATE TO authenticated USING (true);
CREATE POLICY "registros_delete_admin" ON public.registros_ecu FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'administrador'));
CREATE INDEX idx_registros_estado ON public.registros_ecu (estado);
CREATE INDEX idx_registros_cliente ON public.registros_ecu (cliente_id);

-- HISTORIAL (bitácora inmutable)
CREATE TABLE public.historial_estados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id UUID NOT NULL REFERENCES public.registros_ecu ON DELETE CASCADE,
  estado_anterior public.estado_ecu,
  estado_nuevo public.estado_ecu NOT NULL,
  usuario_id UUID REFERENCES auth.users ON DELETE SET NULL,
  motivo TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.historial_estados TO authenticated;
GRANT SELECT, INSERT ON public.historial_estados TO service_role;
ALTER TABLE public.historial_estados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "historial_select" ON public.historial_estados FOR SELECT TO authenticated USING (true);
CREATE POLICY "historial_insert" ON public.historial_estados FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_historial_registro ON public.historial_estados (registro_id, created_at);

-- Bitácora automática
CREATE OR REPLACE FUNCTION public.log_estado_registro()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.historial_estados (registro_id, estado_anterior, estado_nuevo, usuario_id, observaciones)
    VALUES (NEW.id, NULL, NEW.estado, COALESCE(NEW.recibido_por, auth.uid()), 'Recepción de la ECU');
  ELSIF NEW.estado IS DISTINCT FROM OLD.estado THEN
    INSERT INTO public.historial_estados (registro_id, estado_anterior, estado_nuevo, usuario_id, motivo)
    VALUES (NEW.id, OLD.estado, NEW.estado, auth.uid(), NEW.motivo_falla);
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_log_estado_insert AFTER INSERT ON public.registros_ecu
FOR EACH ROW EXECUTE FUNCTION public.log_estado_registro();
CREATE TRIGGER trg_log_estado_update BEFORE UPDATE ON public.registros_ecu
FOR EACH ROW EXECUTE FUNCTION public.log_estado_registro();

-- DIAGNOSTICOS
CREATE TABLE public.diagnosticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id UUID NOT NULL REFERENCES public.registros_ecu ON DELETE CASCADE,
  tecnico_id UUID REFERENCES auth.users ON DELETE SET NULL,
  diagnostico TEXT,
  observaciones TEXT,
  tiempo_minutos INTEGER,
  resultado TEXT,
  motivo_falla TEXT,
  reparaciones_realizadas TEXT,
  recomendaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.diagnosticos TO authenticated;
GRANT ALL ON public.diagnosticos TO service_role;
ALTER TABLE public.diagnosticos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "diagnosticos_select" ON public.diagnosticos FOR SELECT TO authenticated USING (true);
CREATE POLICY "diagnosticos_insert" ON public.diagnosticos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "diagnosticos_update" ON public.diagnosticos FOR UPDATE TO authenticated USING (true);

-- NOTIFICACIONES
CREATE TABLE public.notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id UUID REFERENCES public.registros_ecu ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  canal TEXT NOT NULL DEFAULT 'whatsapp',
  mensaje TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.notificaciones TO authenticated;
GRANT ALL ON public.notificaciones TO service_role;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notificaciones_select" ON public.notificaciones FOR SELECT TO authenticated USING (true);
CREATE POLICY "notificaciones_insert" ON public.notificaciones FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "notificaciones_update" ON public.notificaciones FOR UPDATE TO authenticated USING (true);

-- Notificación automática en estados finales
CREATE OR REPLACE FUNCTION public.crear_notificacion_estado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.estado IS DISTINCT FROM OLD.estado AND NEW.estado IN ('no_reparable','no_reparada','reparada') THEN
    INSERT INTO public.notificaciones (registro_id, cliente_id, tipo, mensaje)
    VALUES (
      NEW.id, NEW.cliente_id, NEW.estado::text,
      CASE NEW.estado
        WHEN 'reparada' THEN 'Su ECU con folio ' || NEW.folio || ' está reparada y lista para entrega.'
        ELSE 'Su ECU con folio ' || NEW.folio || ' no pudo ser reparada. Puede pasar a recogerla.'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_notificacion_estado AFTER UPDATE ON public.registros_ecu
FOR EACH ROW EXECUTE FUNCTION public.crear_notificacion_estado();

-- Catálogo inicial de modelos
INSERT INTO public.modelos_ecu (nombre, marca) VALUES
  ('Bosch EDC17','Bosch'),('Bosch ME7.9.7','Bosch'),('Siemens SIM2K','Siemens'),
  ('Delphi MT80','Delphi'),('Continental SID206','Continental'),('Denso SH7058','Denso');