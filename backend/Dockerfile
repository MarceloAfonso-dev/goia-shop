# Development Dockerfile
FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

# Copy pom.xml first for better caching
COPY pom.xml .

# Copy source code
COPY src ./src

# Expose port 8080
EXPOSE 8080

# Run in development mode with hot reload
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-Dspring.profiles.active=dev'"]
