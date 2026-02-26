package com.jason7599.cocatalk.user.relation;

import com.jason7599.cocatalk.user.UserInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserRelationService {

    private final UserRelationRepository userRelationRepository;

    public List<UserInfo> getContacts(Long userId) {
        return userRelationRepository.getContacts(userId);
    }

    public List<UserInfo> getBlockedUsers(Long userId) {
        return userRelationRepository.getBlockedUsers(userId);
    }
}
