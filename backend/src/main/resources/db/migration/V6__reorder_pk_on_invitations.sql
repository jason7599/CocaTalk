ALTER TABLE invitations DROP CONSTRAINT invitations_pkey;
ALTER TABLE invitations ADD CONSTRAINT invitations_pkey PRIMARY KEY (receiver_id, room_id);