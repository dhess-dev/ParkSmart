package com.example.backend;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.models.GateAccess;
import com.example.backend.repositories.GateAccessRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;

@Service
public class Booking {

    @Autowired
    private GateAccessRepository gateAccessRepository;

    public void newBooking() {
        String uuid = UUID.randomUUID().toString();
        GateAccess gateAccess = new GateAccess();
        gateAccess.setQrCodeContent(uuid);
        gateAccessRepository.save(gateAccess);
    }

    public byte[] generateQRCode(String content) throws WriterException, IOException {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, 300, 300);

        BufferedImage qrCode = MatrixToImageWriter.toBufferedImage(bitMatrix);
        ByteArrayOutputStream qrCodeBytes = new ByteArrayOutputStream();
        ImageIO.write(qrCode, "png", qrCodeBytes);

        return qrCodeBytes.toByteArray();
    }
}
