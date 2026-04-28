-- ============================================
-- FUNÇÃO PARA LISTAR TODAS AS TABELAS
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Criar função para listar todas as tabelas do schema public
CREATE OR REPLACE FUNCTION get_all_tables()
RETURNS TABLE (tablename text) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT table_name::text
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
  ORDER BY table_name;
$$;

-- Dar permissão para usar a função
GRANT EXECUTE ON FUNCTION get_all_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_tables() TO anon;
GRANT EXECUTE ON FUNCTION get_all_tables() TO service_role;

-- Testar a função
SELECT * FROM get_all_tables();
