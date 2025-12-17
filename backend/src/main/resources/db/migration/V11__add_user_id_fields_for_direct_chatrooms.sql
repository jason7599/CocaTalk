ALTER TABLE rooms
    ADD COLUMN user1_id BIGINT,
    ADD COLUMN user2_id BIGINT;

ALTER TABLE rooms
    ADD CONSTRAINT fk_rooms_direct_user1 FOREIGN KEY (user1_id) REFERENCES users(id),
    ADD CONSTRAINT fk_rooms_direct_user2 FOREIGN KEY (user2_id) REFERENCES users(id);

ALTER TABLE rooms
    ADD CONSTRAINT chk_direct_users
    CHECK (
        (type = 'DIRECT' AND user1_id IS NOT NULL AND user2_id IS NOT NULL AND user1_id < user2_id)
        OR
        (type = 'GROUP' AND user1_id IS NULL AND user2_id IS NULL)
    );