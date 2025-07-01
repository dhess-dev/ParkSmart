# ParkSmart – Cyber-Physisches Parking-System

> **Ein Cyber-physisches-System, dass jeden Parkplatz in eine smarte, vollständig automatisierte Anlage verwandelt.**

## Inhaltsverzeichnis

1. [Einleitung](#einleitung)
2. [Projektbeschreibung](#projektbeschreibung)
3. [Projekt lokal ausführen](#projekt-lokal-ausführen)
4. [Verschlüsselte Kommunikation: Frontend ↔ Backend](#verschlüsselte-kommunikation-frontend-↔-backend)
5. [Wichtige Komponenten](#wichtige-komponenten)
6. [Funktions‑Highlights](#funktions-highlights)
7. [Architekturübersicht](#architekturübersicht)
8. [Repository‑Struktur](#repository-struktur)
9. [Backend‑Dienst](#backend-dienst)
10. [Run Chrome ignoring cert](#run-chrome-igonring-cert)
11. [Pins für CPS](#pins-for-cps)

## Einleitung

ParkSmart ist ein Schulprojekt für die Friedrich-Ebert-Schule zur Entwicklung eines automatisierten Parkplatz-Systems.

## Projektbeschreibung

Bei ParkSmart werden Sensordaten innerhalb eines Cyber-Physischen Systems (CPS) mithilfe von MQTT an ein Backend übermittelt, dort verarbeitet und anschließend erneut per MQTT an das CPS zurückgesendet. Auf Grundlage dieser Daten agieren Aktoren, sodass eine Parkfläche vollautomatisiert betrieben wird.

Die Sensoren und Aktoren werden jeweils an zwei ESP32-S3 Dev Modules und zwei ESP-WROOM-32 Controllern angeschlossen.

Im Client können sich Nutzer registrieren und Parkplätze buchen. Durch die Buchung wird im Backend ein QR-Code generiert und passend in der Datenbank gespeichert, sodass sich der Nutzer mithilfe dieses QR-Codes validieren und Zugang zur Parkfläche erhalten kann. 

Fährt ein Auto auf einen Parkplatz wird dieser durch eine rote LED als besetzt angezeigt. 
Außerdem bietet das System eine Übersicht über freie Parkplätze sowie Statistiken zur Auslastung der Fläche.
Die Kommunikation zwischen Backend und Frontend ist über HTTPS geregelt.
Die Benutzer, Buchungen, Buchungsangebote, Belegung der Parkplätze sowie die Anzahl der Besucher pro Tag werden in einer PostgreSQL-Datenbank gespeichert.

Das Projekt wurde in vier Sprints unterteilt. Um den aktuellen Stand der jeweiligen Sprints einschätzen zu können, wurde für jeden Sprint ein Burndown-Chart erstellt. Diese sind in diesem Projekt unter /projektmanagement zu finden.
Die Tickets, die in den Sprints bearbeitet wurden, sind unter GitHub im Projekt ParkSmart zu finden (https://github.com/orgs/fes-wiesbaden/projects/15).

## Projekt lokal ausführen

**Hinweis:** In echten Produktivprojekten speichert man keine Zertifikate oder sensiblen Konfigurationsdateien im Repository. Da wir hier jedoch ausschließlich selbstsignierte Zertifikate verwenden und zeigen möchten, wie die Infrastruktur funktioniert, haben wir alles für Demonstrationszwecke im Ordner `demo` beigelegt.

Wenn Sie das Projekt lokal ausführen möchten, finden Sie im Verzeichnis `demo` ein vollständiges Archiv mit Zertifikaten, Konfiguration und Quellcode. Gehen Sie wie folgt vor:

1. Entpacken Sie das Archiv im `demo`-Verzeichnis.
2. Navigieren Sie in den Ordner `database` und starten Sie PostgreSQL mit:

   ```bash
   docker compose up -d postgres
   ```
3. Wechseln Sie in das Verzeichnis `backend` und starten Sie die Spring-Boot-API mit:

   ```bash
   ./gradlew bootRun
   ```
4. Starten Sie im `frontend`-Ordner die Benutzeroberfläche mit:

   ```bash
   npm install
   npm run dev
   ```

Anschließend können Sie die Anwendung im Browser unter [http://localhost:5173](http://localhost:5173) aufrufen. Je nach persönlicher Konfiguration muss noch das Backend erlaubt werden, da kein gelistetes Zertifikat verwendet wurde unter [http://localhost:8443](http://localhost:8443)

Ein Admin-Login ist mit folgenden Anmeldeinformationen möglich: Benutzername: admin und dem Passwort: admin123
Dadurch sind alle Funktionalitäten der Webseite wie Adminseite und Dashboard freigeschaltet.

## Verschlüsselte Kommunikation: Frontend ↔ Backend

Das Frontend kommuniziert ausschließlich über HTTPS mit dem Backend. Die Absicherung erfolgt wie folgt:

Das Spring-Boot-Backend stellt alle REST- und SSE-Endpunkte über Port 443 (HTTPS) bereit.

Ein PKCS12-Keystore (keystore.p12) mit einem selbstsignierten X.509-Zertifikat aktiviert die TLS-Verschlüsselung.

Das Frontend (React/Vite) stellt alle API-Anfragen (z. B. /api/users, /api/parkingSpot) über https://... – also verschlüsselt –.

Zusätzlich wird auch der Vite-Entwicklungsserver (Frontend) selbst via HTTPS ausgeliefert:

Dafür werden im vite.config.js lokale TLS-Zertifikate (cert.pem & key.pem) eingebunden.

Dadurch läuft npm run dev auf https://localhost:5173 – das entspricht produktionsnahen Bedingungen und verhindert Browser-Fehler durch „Mixed Content“.

Auch Server-Sent Events (SSE) laufen über denselben HTTPS-Kanal.

So ist gewährleistet, dass keine sensiblen Daten (z. B. Passwörter oder Buchungen) unverschlüsselt übertragen werden.

## Wichtige Komponenten

* **Cyber‑Physisches System (CPS):** Mikrocontroller‑basierte Sensoren und Aktoren steuern das Parkhaus.
* **Backend:** Eine Spring‑Boot‑3.4‑REST‑API abonniert MQTT‑Topics, persistiert Daten in PostgreSQL, stellt **SSE**‑Streams für Live‑Updates bereit und übernimmt Authentifizierung.
* **Sicherheit:** Alle REST‑Endpunkte laufen über HTTPS mit X.509‑Zertifikaten (.pem / .p12). MQTT wird über eine unverschlüsselte Verbindung (tcp:// Port 1883) mit Benutzername/Passwort‑Authentifizierung verwendet.
* **Frontend:** Eine React‑18‑Single‑Page‑App (Vite, MUI) liefert Dashboards, Buchungen und ein Admin‑Interface.
* **Raspberry Pi**: Hosten von Backend, Datenbank und MQTT-Broker über Docker Compose. Dient als zentrale Brücke zwischen Webplattform und CPS-Geräten.



> So entsteht ein Echtzeitsystem, in dem Nutzer\:innen Parkplätze buchen, anfahren und das Parkhaus ohne Personal betreten oder verlassen können.

---

## Funktions‑Highlights

| Thema       | Funktionen                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------- |
| **User**     | Registrierung (Tarife & Rollen), sitzungsbasiert ohne JWT (Spring Security 6), Profilverwaltung     |
| **Parking**  | Live‑Belegungsanzeige, Ultraschall‑Distanzmessung, automatische Erkennung „voll“/„frei“             |
| **Bookings** | Tarifabhängige Preise, Vorausbuchungen, QR/RFID‑Validierung am Eingang, Überziehungs‑Erkennung      |
| **Gates**    | Servo‑betriebene Schranken, automatisches Öffnen/Schließen via MQTT, manueller Notbetrieb           |
| **Admin**    | CRUD für Tarife, Nutzer\:innen, Stellplätze; Belegungsverlauf; SSE‑Benachrichtigungen               |
| **DevOps**   | Docker‑Compose für lokale Entwicklung, Raspberry‑Pi‑Stack für On‑Prem‑Deployment, GitHub‑Actions‑CI |

---

## Architekturübersicht

```
┌──────────────────────────┐        SSE         ┌──────────────────────────┐
│      Frontend (Vite)     │◄───────────────────┤    Backend (Spring)      │
│  • React 18 + MUI        | REST API via HTTPS │  • REST API              │
│  • Vite + Vitest         │◄──────────────────►|  • Spring Security       │
└──────────────────────────┘                    │  • JPA / PostgreSQL      │
                                                │  • MQTT‑Client           │
                                                └──────────────────────────┘ 
┌──────────────────────────┐      MQTT Pub                ▲  ▲  
│    Mosquitto Broker      │◄─────────────────────────────┘  |
|                          |      MQTT SUB                   |           
└──────────▲───────────────┘─────────────────────────────────┘                                                
MQTT Sub│  │ MQTT Pub                               
        │  |                                        
┌───────▼──────────────────┐                   
│  CPS (Arduino)           │
│  • Ultraschallsensoren   │
│  • Schranken‑Servos      │
│  • LED‑Guidance          │
│  • QR / RFID‑Reader      │ 
│  • LCD-Display           │
└──────────────────────────┘
```
---


## Repository-Struktur

| Pfad                       | Zweck                                                                                      | Kommuniziert mit                        |
|----------------------------|---------------------------------------------------------------------------------------------|----------------------------------------|
| `frontend/`                | React-18 (Vite + MUI) mit UI für Buchungen, Übersicht & Admin                             | `/backend` via HTTPS                     |
| `backend/`                 | Spring Boot 3.4 REST-API: Authentifizierung, Abrechnung, MQTT‑Brücke, SSE‑Streaming       | `database/`, `cps/`, `frontend/`         |
| `database/`                | Docker Compose für lokale PostgreSQL‑Instanz                                              | `backend/`                              |
| `cps/`                     | Arduino-Sketche für Einfahrt, Ausfahrt, Distanzmessung, LEDs & MQTT‑Kommunikation         | `Raspberry-PI_deployment/`, `backend/`   |
| `Raspberry-PI_deployment/` | Docker-Setup für ARM: PostgreSQL, Mosquitto, Backend (Spring Boot)                        | `cps/`, `frontend/`, `backend/`          |
| `certs/`                   | Selbstsignierte TLS-Zertifikate (PEM & PKCS#12) für HTTPS‑API & Entwicklung               | `backend/`,                              |
| `.github/`                 | CI-Workflows: Build‑Tests, Docker‑Image‑Erstellung und Push auf GitHub Container Registry | `backend/`, GitHub Actions               |
| `.projektmanagement/`                 | Ablage der Burndowncharts | -----                                                                                         |
| `.demo/`                   | Ablage des Repos mit Zertifikaten    | -----                                                                                         |

---

## Backend‑Dienst

### Technologiestack

* Java 21, Spring Boot 3.4
* Spring WebMVC, Spring Security 6, Spring Data JPA (Hibernate)
* PostgreSQL 16 (Dev/Prod), H2 (Tests)
* Eclipse Paho MQTT‑Client
* Server‑Sent Events (SSE) für Push‑Updates
* Gradle 8 Build

### Entitäten

| Entität         | Aufgabe                                      | Beziehungen                   |
| --------------- | -------------------------------------------- | ----------------------------- |
| `User`          | Zugangsdaten, Rollen, aktiver Tarif          | 1‑n `Booking`                 |
| `Plan`          | Buchungspläne                                | n‑n `User`                    |
| `ParkingSpot`   | Belegung der Parkplätze                      | keine Beziehung               |
| `Booking`       | Reservierungsfenster & QR-Codes              | n‑1 `User`                    |
| `GateAccess`    | RFID‑Validierungen                           | n‑1 `User`                    |
| `ParkingStatus` | Anzahl der freien Parkplätze                 | keine Beziehung               |
| `ParkingCount`  | Historische Tages‑Totals                     | keine Beziehung               |   

### Service‑ & Controller‑Schicht

* `UserService` / `UserController` – Registrierung, Login, Profil.
* `PlanService` / `AdminController` – CRUD für Tarife.
* `ParkingService` – Kernlogik; abonniert MQTT, aktualisiert Spots, sendet SSE.
* `ParkingSpotSseService`, `ParkingStatusSseService`, `ParkingCountSseService` – Multicast‑Updates ans Frontend.
* `BookingService` – neue Buchungen, Kollisionsprüfung.
* `GateAccessController` – QR/RFID prüfen, Schranke steuern.

### Sicherheit

* Spring Security‑Filterkette in `SecurityConfig`.
* BCrypt‑Hashes, zustandslose Session‑Cookies, CORS via Env `CORS_Origin`.
* TLS via `keystore.p12`; Mosquitto nutzt `.pem`‑Kette aus `certs/`.

## Run Chrome igonring cert

```bash
chrome.exe --ignore-certificate-errors
```

## Pins for cps

RFID Reader:

SDA: 10

MOSI: 11

MISO: 13

SCK: 12



Ultra sonic (parking spot):

VCC: 5V

TRIG: 5

ECHO: 7

VCC: 5V

TRIG: trigPinSpotA1 = 5;

ECHO: echoPinSpotA1 = 18;


VCC: 5V

TRIG: trigPinSpotA2 = 32;

ECHO: echoPinSpotA2 = 33;


VCC: 5V

TRIG: trigPinSpotA3 = 26;

ECHO: echoPinSpotA3 = 27;


VCC: 5V

TRIG: trigPinSpotA4 = 12;

ECHO: echoPinSpotA4 = 13;


Ultra sonic (close entry gate):

VCC: 5V

TRIG: 4

ECHO: 6


Ultra sonic (open exit gate):

VCC: 5V

TRIG: 16

ECHO: 17


Ultra sonic (close exit gate):

VCC: 5V

TRIG: 5

ECHO: 7


Servo Motor Entry Gate

Brown: GND

Red: VCC -> 5V

Orange: PWM: 18


Servo Motor Exit Gate

Brown: GND

Red: VCC -> 5V

Orange: PWM: 15


LEDs

ledA1Red = 22;

int ledA1Green = 23;

ledA2Red = 19;

ledA2Green = 21;

ledA3Red = 5;

ledA3Green = 18;

ledA4Red = 16;

ledA4Green = 17;

ESP32 Cam (ESP32 Wrover Kit (all kits))

gnd:gnd

5V: 5V

RX:U0T

TX: U0R


LCD-Display

SCL: 9

SDA: 8

VCC: 5v

GND: GND
