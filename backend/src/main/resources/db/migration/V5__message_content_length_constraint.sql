ALTER TABLE messages
    ADD CONSTRAINT messages_content_length_check
    CHECK (content IS NULL OR LENGTH(content) <= 1000);