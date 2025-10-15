package com.jason7599.cocatalk.message;

import jakarta.persistence.Embeddable;

import java.io.Serializable;

@Embeddable
public record MessageId(
        Long roomId,
        Long seqNo
) implements Serializable {
}
