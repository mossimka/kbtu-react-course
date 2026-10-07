FROM docker.io/library/eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/mission-api-0.0.1-SNAPSHOT.jar"]