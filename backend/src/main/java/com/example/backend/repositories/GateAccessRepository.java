package com.example.backend.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.models.GateAccess;

@Repository
public interface GateAccessRepository extends JpaRepository<GateAccess, Long> {

    Optional<GateAccess> findByRfidCode(String rfidCode);

    Optional<GateAccess> findByQrCodeContent(String qrCodeContent);
}
