-- Tabelas para a Imersão T4 - Programa de Indicação

-- Tabela de Perfis
CREATE TABLE IF NOT EXISTS public.imersao_t4_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    ref_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de Compras (Vendas atribuídas)
CREATE TABLE IF NOT EXISTS public.imersao_t4_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_email TEXT NOT NULL,
    ref_code TEXT NOT NULL,
    referrer_id UUID REFERENCES public.imersao_t4_profiles(id),
    product_name TEXT,
    amount NUMERIC,
    status TEXT DEFAULT 'APPROVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_imersao_t4_purchase UNIQUE (buyer_email, ref_code)
);

-- RLS (Liberado para MVP)
ALTER TABLE public.imersao_t4_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imersao_t4_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All Profiles T4" ON public.imersao_t4_profiles FOR SELECT USING (true);
CREATE POLICY "Allow All Purchases T4" ON public.imersao_t4_purchases FOR SELECT USING (true);

-- View do Ranking
CREATE OR REPLACE VIEW public.imersao_t4_leaderboard AS
SELECT 
    p.name,
    COUNT(pr.id) as total_sales
FROM public.imersao_t4_profiles p
LEFT JOIN public.imersao_t4_purchases pr ON pr.referrer_id = p.id AND pr.status = 'APPROVED'
GROUP BY p.id, p.name
ORDER BY total_sales DESC
LIMIT 10;
