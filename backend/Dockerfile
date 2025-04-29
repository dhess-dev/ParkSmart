FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy the built jar file
COPY build/libs/*.jar app.jar

# Copy the SSL keystore into the app folder
COPY src/main/resources/keystore.p12 keystore.p12

# Expose HTTPS port
EXPOSE 8443

ENTRYPOINT ["java", "-jar", "app.jar"]
