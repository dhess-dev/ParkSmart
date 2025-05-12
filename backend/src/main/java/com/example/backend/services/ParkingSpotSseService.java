package com.example.backend.services;

import com.example.backend.models.ParkingSpot;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ParkingSpotSseService {
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

    public void broadcast(List<ParkingSpot> spots) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(spots);
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }

}
