package com.example.backend.services;

import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final Executor executor;

    public UserService(UserRepository userRepository,
                       @Qualifier("taskExecutor") Executor executor) {
        this.userRepository = userRepository;
        this.executor       = executor;
    }

    @Async
    public CompletableFuture<ResponseEntity<User>> findCurrent(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return CompletableFuture.completedFuture(
                    ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
            );
        }
        return CompletableFuture.supplyAsync(() -> {
            User u = userRepository.findByUsername(auth.getName())
                    .orElse(null);
            return u == null
                    ? ResponseEntity.notFound().build()
                    : ResponseEntity.ok(u);
        }, executor);
    }

    @Async
    @Transactional
    public CompletableFuture<ResponseEntity<User>> updateProfile(
            Authentication auth,
            User incoming
    ) {
        return findCurrent(auth)
                .thenCompose(response -> {
                    if (!response.getStatusCode().is2xxSuccessful()) {
                        return CompletableFuture.completedFuture(response);
                    }

                    User existing = response.getBody();
                    existing.setFirstName   (incoming.getFirstName());
                    existing.setLastName    (incoming.getLastName());
                    existing.setEmail       (incoming.getEmail());
                    existing.setPhoneNumber (incoming.getPhoneNumber());
                    existing.setAddress     (incoming.getAddress());
                    existing.setCity        (incoming.getCity());
                    existing.setCountry     (incoming.getCountry());
                    existing.setPostalCode  (incoming.getPostalCode());

                    User saved = userRepository.save(existing);
                    return CompletableFuture.completedFuture(
                            ResponseEntity.ok(saved)
                    );
                });
    }
}

