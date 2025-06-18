package com.example.backend.controller;

import com.example.backend.models.Booking;
import com.example.backend.models.User;
import com.example.backend.services.BookingService;
import com.example.backend.repositories.BookingRepository;
import com.example.backend.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService, UserRepository userRepository, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(
            Authentication authentication,
            @RequestBody BookingRequest bookingRequest) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        try {
            Booking booking = bookingService.createBooking(
                    user,
                    bookingRequest.getType(),
                    bookingRequest.getStartTime(),
                    bookingRequest.getEndTime());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating booking: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBookings(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(bookingService.getBookingsByUser(user));
    }

    @GetMapping("/qrcode/{qrCodeContent}")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String qrCodeContent) {
        try {
            byte[] qrCode = bookingService.generateQRCode(qrCodeContent);
            return ResponseEntity.ok()
                    .header("Content-Type", "image/png")
                    .body(qrCode);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    public Booking getBookingByQrCode(String qrCode) {
        return bookingRepository.findByQrCodeContent(qrCode).orElse(null);
    }

    public static class BookingRequest {
        private String type;
        private OffsetDateTime startTime;
        private OffsetDateTime endTime;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public OffsetDateTime getStartTime() {
            return startTime;
        }

        public void setStartTime(OffsetDateTime startTime) {
            this.startTime = startTime;
        }

        public OffsetDateTime getEndTime() {
            return endTime;
        }

        public void setEndTime(OffsetDateTime endTime) {
            this.endTime = endTime;
        }
    }
}