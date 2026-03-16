package com.jason7599.cocatalk.message;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record MessageId(
        long roomId,
        long seq
) implements Serializable {
}
