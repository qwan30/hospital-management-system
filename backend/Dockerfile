FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml pom.xml
COPY shared/pom.xml shared/pom.xml
COPY core/pom.xml core/pom.xml
COPY api/pom.xml api/pom.xml

COPY shared/src shared/src
COPY core/src core/src
COPY api/src api/src

RUN mvn -q -pl api -am package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /workspace/api/target/api-0.1.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
