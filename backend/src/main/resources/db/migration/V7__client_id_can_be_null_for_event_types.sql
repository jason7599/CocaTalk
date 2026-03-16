ALTER TABLE messages
    ALTER COLUMN client_id DROP NOT NULL,
    DROP CONSTRAINT messages_room_client_unique;

CREATE UNIQUE INDEX messages_room_client_unique
    ON messages(room_id, client_id)
    WHERE kind = 'USER';

ALTER TABLE messages
    ADD CONSTRAINT messages_client_id_shape_check
        CHECK (
            (kind = 'USER' AND client_id IS NOT NULL)
            OR
            (kind = 'EVENT' AND client_id IS NULL)
        );