FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml pom.xml
COPY domain/pom.xml domain/pom.xml
COPY infrastructure/pom.xml infrastructure/pom.xml
COPY application/pom.xml application/pom.xml
COPY controller/pom.xml controller/pom.xml
COPY start/pom.xml start/pom.xml

COPY domain/src domain/src
COPY infrastructure/src infrastructure/src
COPY application/src application/src
COPY controller/src controller/src
COPY start/src start/src

RUN mvn -q -pl start -am package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /workspace/start/target/start-0.1.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
