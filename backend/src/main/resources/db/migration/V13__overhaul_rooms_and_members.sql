ALTER TABLE groupchat_members RENAME TO room_members;

ALTER TABLE rooms
    DROP CONSTRAINT chk_direct_users,
    DROP COLUMN user1_id CASCADE,
    DROP COLUMN user2_id CASCADE;

CREATE TABLE direct_rooms (
    room_id BIGINT PRIMARY KEY REFERENCES rooms(id) ON DELETE CASCADE,
    user1_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    user2_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

    CHECK(user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);