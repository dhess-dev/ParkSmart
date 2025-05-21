package com.example.backend.controller;

import com.example.backend.models.User;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        userRepository.findAll().forEach(u -> System.out.println("user = " + u.getUsername()));
        return userRepository.findAll();
    }


    @PostMapping
    public User createUser(@RequestBody User user) {

        if (!user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(user.getPassword())); // Hash the password
            user.getRoles().add("USER");
        }
        return userRepository.save(user);
    }

    @GetMapping("/me")
    public CompletableFuture<ResponseEntity<User>> getCurrentUser(Authentication auth) {
        return userService.findCurrent(auth);
    }


    @PutMapping("/me")
    public CompletableFuture<ResponseEntity<User>> updateProfile(
            Authentication authentication,
            @RequestBody User incoming
    ) {
        return userService.updateProfile(authentication, incoming);
    }

    /**
     * DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User incoming
    ) {
        return userRepository.findById(id).map(existing -> {
            existing.setFirstName(incoming.getFirstName());
            existing.setLastName(incoming.getLastName());
            existing.setPhoneNumber(incoming.getPhoneNumber());
            existing.setAddress(incoming.getAddress());
            existing.setCity(incoming.getCity());
            existing.setCountry(incoming.getCountry());
            existing.setPostalCode(incoming.getPostalCode());

            User saved = userRepository.save(existing);
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

}
