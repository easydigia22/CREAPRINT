-- CreaPrint — Design & Impression (Marrakech)
-- Schéma SQL complet Supabase / PostgreSQL (18 tables + relations + RLS)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES (liés à auth.users avec gestion des rôles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  city TEXT DEFAULT 'Marrakech',
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'commercial', 'production', 'client')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'Marrakech',
  ice TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LEADS (CRM / Prospects + capture UTM)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'Marrakech',
  source TEXT NOT NULL DEFAULT 'site' CHECK (source IN ('site', 'whatsapp', 'instagram', 'facebook', 'google', 'magasin')),
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'contacte', 'devis_envoye', 'gagne', 'perdu')),
  tags TEXT[] DEFAULT '{}',
  requested_product TEXT NOT NULL,
  estimated_budget NUMERIC(12,2),
  summary TEXT,
  notes JSONB DEFAULT '[]'::jsonb,
  next_follow_up DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCT_CATEGORIES
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  accent TEXT DEFAULT 'cyan',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  image_url TEXT,
  starting_price_mad NUMERIC(12,2),
  unit_price_base_mad NUMERIC(12,2),
  min_qty INTEGER NOT NULL DEFAULT 1,
  indicative_lead_time TEXT NOT NULL DEFAULT '48h ouvrées (indicatif)',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. PRODUCT_OPTIONS
CREATE TABLE IF NOT EXISTS public.product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  option_type TEXT NOT NULL CHECK (option_type IN ('format', 'paper', 'finishing', 'quantity', 'orientation', 'color')),
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  price_delta_mad NUMERIC(12,2) NOT NULL DEFAULT 0,
  price_multiplier NUMERIC(6,3) NOT NULL DEFAULT 1.000,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 7. PRICE_RULES
CREATE TABLE IF NOT EXISTS public.price_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL,
  max_qty INTEGER,
  unit_price_mad NUMERIC(12,2) NOT NULL,
  setup_fee_mad NUMERIC(12,2) NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 8. QUOTE_REQUESTS (configurateur client)
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  design_needed BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_mode TEXT NOT NULL DEFAULT 'retrait' CHECK (delivery_mode IN ('retrait', 'livraison')),
  urgency TEXT NOT NULL DEFAULT 'standard',
  estimated_price_mad NUMERIC(12,2),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. QUOTES (Devis officiels)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'envoye', 'accepte', 'refuse', 'expire')),
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  tva_percent NUMERIC(5,2) NOT NULL DEFAULT 20,
  valid_until DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. QUOTE_ITEMS
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_mad NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 11. ORDERS (Commandes / Production Kanban)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'a_verifier' CHECK (
    status IN ('a_verifier', 'devis_valide', 'en_production', 'controle_qualite', 'prete', 'livree', 'annulee')
  ),
  payment_status TEXT NOT NULL DEFAULT 'en_attente' CHECK (payment_status IN ('en_attente', 'acompte', 'paye')),
  total_ttc_mad NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid_mad NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_method TEXT NOT NULL DEFAULT 'retrait' CHECK (delivery_method IN ('retrait', 'livraison')),
  estimated_delivery_date DATE,
  internal_notes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. ORDER_ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  specifications TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_mad NUMERIC(12,2) NOT NULL DEFAULT 0
);

-- 13. UPLOADED_FILES
CREATE TABLE IF NOT EXISTS public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'en_attente' CHECK (review_status IN ('en_attente', 'valide', 'correction_demandee')),
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. MESSAGES (Messagerie client <-> équipe liée aux commandes)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'equipe')),
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. GALLERY_ITEMS
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cartes', 'vetements', 'enseignes', 'affiches', 'evenements', 'restaurants')),
  client_sector TEXT,
  description TEXT,
  specs TEXT,
  image_url TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  role TEXT,
  organization TEXT,
  project_type TEXT,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  company_name TEXT NOT NULL DEFAULT 'CreaPrint',
  signature TEXT NOT NULL DEFAULT 'DESIGN & IMPRESSION',
  hashtag TEXT NOT NULL DEFAULT '#CreaPrintMarrakech',
  phone_display TEXT NOT NULL DEFAULT '06 90 62 62 13',
  whatsapp_number TEXT NOT NULL DEFAULT '+212 6 90 62 62 13',
  email TEXT NOT NULL DEFAULT 'contact@creaprint.ma',
  city TEXT NOT NULL DEFAULT 'Marrakech, Maroc',
  address_label TEXT,
  maps_query TEXT DEFAULT 'Marrakech, Maroc',
  opening_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  default_whatsapp_message TEXT,
  default_tva_percent NUMERIC(5,2) NOT NULL DEFAULT 20,
  billing_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  terms_summary TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. ACTIVITY_LOGS
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_messages_order ON public.messages(order_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique du catalogue, galerie et paramètres
CREATE POLICY "Public read active products" ON public.products FOR SELECT USING (active = TRUE);
CREATE POLICY "Public read gallery" ON public.gallery_items FOR SELECT USING (TRUE);
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (TRUE);
CREATE POLICY "Public insert leads" ON public.leads FOR INSERT WITH CHECK (TRUE);

-- Accès staff (admin, commercial, production)
CREATE OR REPLACE FUNCTION public.is_staff() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'commercial', 'production') AND active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Staff full access leads" ON public.leads FOR ALL USING (public.is_staff());
CREATE POLICY "Staff full access quotes" ON public.quotes FOR ALL USING (public.is_staff());
CREATE POLICY "Staff full access orders" ON public.orders FOR ALL USING (public.is_staff());
CREATE POLICY "Staff full access files" ON public.uploaded_files FOR ALL USING (public.is_staff());
CREATE POLICY "Staff full access messages" ON public.messages FOR ALL USING (public.is_staff());
