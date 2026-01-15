DROP TABLE friendships;

CREATE TABLE contacts (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, contact_id),
    CONSTRAINT contacts_no_self CHECK (user_id <> contact_id)
);