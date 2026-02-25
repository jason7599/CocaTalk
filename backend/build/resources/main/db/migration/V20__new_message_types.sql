ALTER TABLE messages
    ALTER COLUMN content DROP NOT NULL,

    ADD COLUMN type VARCHAR(15) NOT NULL DEFAULT 'USER',

    ADD CONSTRAINT chk_message_type CHECK (type IN (
        'USER',
        'ROOM_CREATED',
        'USER_JOINED',
        'USER_LEFT'
    )),

    ADD CONSTRAINT chk_content_for_user CHECK (type = 'USER' AND content IS NOT NULL)
;