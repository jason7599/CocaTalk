ALTER TABLE rooms
RENAME COLUMN next_seq TO last_seq;

ALTER TABLE invitations
RENAME COLUMN sent_at TO created_at;