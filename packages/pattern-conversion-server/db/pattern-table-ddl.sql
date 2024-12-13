CREATE TABLE public.account (
	id serial,
	username varchar NULL,
	"password" varchar NULL,
	email varchar NULL,
	avatar varchar NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT account_pk PRIMARY KEY (id)
);

CREATE TABLE public."role" (
	id serial,
	role_name varchar NOT NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT role_pk PRIMARY KEY (id),
	CONSTRAINT role_unique UNIQUE (role_name)
);
CREATE TABLE public.account_role (
	id serial,
	account_id int4 NULL,
	role_id int4 NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	CONSTRAINT account_role_pk PRIMARY KEY (id)
);


-- public.account_role foreign keys

ALTER TABLE public.account_role ADD CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES public.account(id);
ALTER TABLE public.account_role ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES public."role"(id);

CREATE TABLE public.project (
	id serial PRIMARY KEY,
	project_name varchar NOT NULL,
	"path" varchar NULL,
	is_current bool NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	account_id int4 NULL,
	CONSTRAINT project_unique UNIQUE (project_name)
);

-- public.resource definition

-- Drop table

-- DROP TABLE public.resource;

CREATE TABLE public.resource (
	id serial,
	"path" varchar NULL,
	status varchar NULL,
	project_id int4 NULL,
	file_name varchar NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	conversion_frequency int4 NULL,
	error_log varchar NULL,
	md5 varchar NULL,
	CONSTRAINT resource_pk PRIMARY KEY (id)
);



-- public.project foreign keys

ALTER TABLE public.project ADD CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES public.account(id);


-- public.resource foreign keys

ALTER TABLE public.resource ADD CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES public.project(id);

-- public.history definition

-- Drop table

-- DROP TABLE public.history;

CREATE TABLE public.history (
	id serial,
	"content" varchar NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	resource_id int4 NULL,
	CONSTRAINT history_pk PRIMARY KEY (id)
);
