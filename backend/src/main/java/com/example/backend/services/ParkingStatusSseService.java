package com.example.backend.services;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.example.backend.models.ParkingStatus;

@Service
public class ParkingStatusSseService {
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

     public void broadcast(List<ParkingStatus> status) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(status);
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }
}
