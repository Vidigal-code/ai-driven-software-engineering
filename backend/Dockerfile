FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline
COPY src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S -g 10001 library && adduser -S -u 10001 -G library library
WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/target/library-api.jar ./library-api.jar
USER 10001:10001
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=60s --retries=12 CMD wget -q --spider http://127.0.0.1:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "/app/library-api.jar"]
