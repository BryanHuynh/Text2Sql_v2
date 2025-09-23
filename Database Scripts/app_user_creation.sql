CREATE ROLE app_user LOGIN PASSWORD 'pw';
GRANT USAGE ON SCHEMA public TO app_user;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.user_details TO app_user;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.user_databases TO app_user;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.user_tables TO app_user;
GRANT INSERT, SELECT, UPDATE, DELETE ON TABLE public.table_variables TO app_user;

