package com.example.backend.services;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.backend.models.Booking;
import com.example.backend.models.User;
import com.example.backend.repositories.BookingRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;


@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking createBooking(User user, String type, OffsetDateTime startTime, OffsetDateTime endTime)
            throws WriterException, IOException {
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setType(type);
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
      
        String qrCodeContent = UUID.randomUUID().toString();
        booking.setQrCodeContent(qrCodeContent);

        return bookingRepository.save(booking);
    }

    public Booking createBooking(Booking booking) {
        return bookingRepository.save(booking);
    }

    public byte[] generateQRCode(String content) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 300, 300);

        ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
        return pngOutputStream.toByteArray();
    }

    public List<Booking> getBookingsByUser(User user) {
        return bookingRepository.findByUser(user);
    }

    public Booking getBookingByQrCode(String qrCode) {
        return bookingRepository.findByQrCodeContent(qrCode).orElse(null);
    }
}