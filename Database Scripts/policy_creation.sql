ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_variables ENABLE ROW LEVEL SECURITY;


DROP POLICY IF EXISTS user_details_policy on public.user_details;
CREATE POLICY user_details_policy
ON user_details
FOR ALL
USING     (id = current_setting('app.current_user_id', true))
WITH CHECK(id = current_setting('app.current_user_id', true));

DROP POLICY IF EXISTS user_databases_policy on public.user_databases;
CREATE POLICY user_databases_policy
ON user_databases
FOR ALL
USING(     
	EXISTS(
		SELECT 1 FROM USER_DETAILS ud
		WHERE ud.id = user_databases.user_id 
		AND ud.id = current_setting('app.current_user_id', true)
	))
WITH CHECK(
	EXISTS(
		SELECT 1 FROM USER_DETAILS ud
		WHERE ud.id = user_databases.user_id 
		AND ud.id = current_setting('app.current_user_id', true)
	)
);

DROP POLICY IF EXISTS user_tables_policy on public.user_tables;
CREATE POLICY user_tables_policy
ON user_tables
FOR ALL
USING(     
	EXISTS(
		SELECT 1 FROM USER_DATABASES d
		WHERE user_tables.user_database_id = d.id
		AND d.user_id = current_setting('app.current_user_id', true)
	))
WITH CHECK(
	EXISTS(
		SELECT 1 FROM USER_DATABASES d
		WHERE user_tables.user_database_id = d.id
		AND d.user_id = current_setting('app.current_user_id', true)
	)
);

DROP POLICY IF EXISTS table_variables_policy on public.table_variables;
CREATE POLICY table_variables_policy
ON table_variables
FOR ALL
USING(     
	EXISTS(
		SELECT 1 FROM USER_TABLES t, USER_DATABASES d
		WHERE table_variables.usertable_id = t.id
		AND t.user_database_id = d.id
		AND d.user_id = current_setting('app.current_user_id', true)
	))
WITH CHECK(
	EXISTS(
		SELECT 1 FROM USER_TABLES t, USER_DATABASES d
		WHERE table_variables.usertable_id = t.id
		AND t.user_database_id = d.id
		AND d.user_id = current_setting('app.current_user_id', true)
	)
);







