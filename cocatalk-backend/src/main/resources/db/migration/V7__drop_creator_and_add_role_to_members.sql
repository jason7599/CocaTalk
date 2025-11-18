ALTER TABLE rooms
    DROP CONSTRAINT fk_rooms_creator,
    DROP COLUMN creator_id,
    ALTER COLUMN name DROP NOT NULL,
    ALTER COLUMN name DROP DEFAULT;

ALTER TABLE room_members
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    ADD CONSTRAINT chk_room_members_role
        CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER'));