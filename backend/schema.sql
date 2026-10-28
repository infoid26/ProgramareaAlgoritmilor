-- Account progress storage.
CREATE TABLE IF NOT EXISTS public.pa_account_progress (tenant_id uuid NOT NULL, object_id uuid NOT NULL, version integer NOT NULL CHECK (version > 0), progress jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (tenant_id, object_id));
-- Accesul se face numai prin backendul autentificat. Nu expune portul SQL browserului.
-- Contul PostgreSQL este păstrat exclusiv în setările App Service; nu există cheie SQL publică.
