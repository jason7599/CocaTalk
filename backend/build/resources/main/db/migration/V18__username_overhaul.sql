ALTER TABLE users
    ADD COLUMN email TEXT NOT NULL,
    ADD COLUMN tag VARCHAR(5) NOT NULL,
    DROP CONSTRAINT users_username_key;

CREATE UNIQUE INDEX users_email_unique ON users (LOWER(email));
CREATE UNIQUE INDEX users_username_tag_unique ON users (username, tag);