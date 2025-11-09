create table pending_jobs (
	correlation_Id UUID PRIMARY KEY,
	user_Id VARCHAR(255) NOT NULL,
	job_Status BOOLEAN NOT NULL,
	created_Date TIMESTAMPTZ NOT NULL,
	updated_Date TIMESTAMPTZ NOT NULL,
	CONSTRAINT fk_user
		FOREIGN KEY (user_Id)
		REFERENCES USER_DETAILS (id)
);
