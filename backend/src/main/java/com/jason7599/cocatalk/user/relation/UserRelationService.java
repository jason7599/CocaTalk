package com.jason7599.cocatalk.user.relation;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.UserEntity;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserRelationService {

    private final UserRepository userRepository;
    private final UserRelationRepository userRelationRepository;

    @Transactional
    public UserInfo addContact(Long userId, Long targetId) {
        // TODO: target user is blocked?

        if (userId.equals(targetId)) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "Cannot add self to contacts");
        }

        UserEntity target = userRepository.findById(targetId)
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "Target user not found"));

        try {
            userRelationRepository.addContact(userId, targetId);
        } catch (DataIntegrityViolationException ex) {
            throw new ApiError(HttpStatus.CONFLICT, "Contact already exists");
        }

        return new UserInfo(target);
    }

    @Transactional
    public void removeContact(Long userId, Long targetId) {
        userRelationRepository.removeContact(userId, targetId);
    }
}
