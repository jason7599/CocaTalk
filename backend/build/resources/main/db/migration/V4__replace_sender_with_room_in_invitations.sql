ALTER TABLE invitations
    DROP CONSTRAINT invitations_no_self,
    DROP CONSTRAINT invitations_pkey,
    DROP COLUMN sender_id;

ALTER TABLE invitations
    ADD COLUMN room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (room_id, receiver_id);

-- Drop old sender-based indexes
DROP INDEX IF EXISTS idx_invitations_sender_sent_at;

-- Create new room-based index
CREATE INDEX idx_invitations_room_sent_at ON invitations(room_id, sent_at DESC);

