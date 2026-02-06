package com.jason7599.cocatalk.contacts;

import com.jason7599.cocatalk.exception.ApiError;
import com.jason7599.cocatalk.user.UserEntity;
import com.jason7599.cocatalk.user.UserInfo;
import com.jason7599.cocatalk.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final UserRepository userRepository;

    @Transactional
    public UserInfo addContact(Long userId, AddContactRequest request) {
        UserEntity contact = userRepository.findByUsernameAndTag(request.username(), request.tag())
                .orElseThrow(() -> new ApiError(HttpStatus.NOT_FOUND, "username not found"));

        if (userId.equals(contact.getId())) {
            throw new ApiError(HttpStatus.BAD_REQUEST, "cannot friend self");
        }

        if (userRepository.contactExists(userId, contact.getId())) {
            throw new ApiError(HttpStatus.CONFLICT, "already contacts");
        }

        userRepository.addContact(userId, contact.getId());
        return new UserInfo(contact);
    }

    @Transactional
    public void removeContact(Long userId, Long contactId) {
        userRepository.removeContact(userId, contactId);
    }

    public List<UserInfo> listContacts(Long userId) {
        return userRepository.listContacts(userId)
                .stream().map(UserInfo::new).toList();
    }
}
