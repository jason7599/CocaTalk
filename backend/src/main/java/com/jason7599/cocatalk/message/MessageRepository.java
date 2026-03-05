package com.jason7599.cocatalk.message;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepository extends JpaRepository<MessageEntity, MessageId> {
}
