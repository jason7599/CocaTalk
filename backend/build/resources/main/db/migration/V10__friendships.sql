CREATE TABLE friendships (
    id1 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id2 BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (id1, id2),
    CHECK (id1 < id2)
);
CREATE INDEX idx_friendships_id2 ON friendships(id2);

CREATE TABLE friend_requests (
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    PRIMARY KEY (sender_id, receiver_id),
    CHECK (sender_id <> receiver_id)
);
CREATE INDEX idx_friend_requests_receiver ON friend_requests(receiver_id);