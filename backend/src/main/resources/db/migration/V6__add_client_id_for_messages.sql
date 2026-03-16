ALTER TABLE messages
    ADD COLUMN client_id UUID NOT NULL,
    ADD CONSTRAINT messages_room_client_unique UNIQUE(room_id, client_id);