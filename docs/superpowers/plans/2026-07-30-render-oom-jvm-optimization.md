# Render OOM and JVM Memory Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix Render 512MiB RAM out-of-memory crash by configuring JVM memory limits, Serial GC, Tiered Compilation level 1, and flexible PORT binding in Spring Boot backend.

**Architecture:** Optimize JVM container execution parameters in `backend/Dockerfile`, update `application.yml` to respect Render's `PORT` environment variable, and update deployment documentation.

**Tech Stack:** Java 17 (Eclipse Temurin JRE), Spring Boot 3.3.5, Docker, Maven.

## Global Constraints

- Maximum Heap size must not exceed 256MB (`-Xmx256m`).
- Must use Serial GC (`-XX:+UseSerialGC`) to minimize container native memory overhead.
- Tiered compilation must stop at level 1 (`-XX:TieredStopAtLevel=1`) for fast startup and minimal JIT memory overhead.
- Server port configuration must map `${PORT:${SERVER_PORT:8081}}`.
- All backend tests must pass (`mvn test`).

---

### Task 1: Optimize Dockerfile JVM Runtime Flags

**Files:**
- Modify: [backend/Dockerfile](file:///d:/projects/hospital-management-system/backend/Dockerfile:33)

**Interfaces:**
- Consumes: JVM container runtime settings
- Produces: Optimized Java 17 container entrypoint with capped memory footprint

- [ ] **Step 1: Inspect backend/Dockerfile ENTRYPOINT**

Verify line 33 of `backend/Dockerfile` currently has `ENTRYPOINT ["java", "-jar", "/app/app.jar"]`.

- [ ] **Step 2: Update ENTRYPOINT with JVM memory flags**

Update line 33 in `backend/Dockerfile` to:
```dockerfile
ENTRYPOINT ["java", "-Xms192m", "-Xmx256m", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-jar", "/app/app.jar"]
```

- [ ] **Step 3: Verify Dockerfile syntax**

Run: `git diff backend/Dockerfile`
Expected: Diff shows updated `ENTRYPOINT` with `-Xms192m`, `-Xmx256m`, `-XX:+UseSerialGC`, `-XX:TieredStopAtLevel=1`.

- [ ] **Step 4: Commit Task 1**

```bash
git add backend/Dockerfile
git commit -m "fix(backend): configure JVM memory limits and SerialGC in Dockerfile for 512MB RAM constraints"
```

---

### Task 2: Configure Server Port Binding & Spring Boot Memory Overhead in application.yml

**Files:**
- Modify: [backend/start/src/main/resources/application.yml](file:///d:/projects/hospital-management-system/backend/start/src/main/resources/application.yml:19-21)
- Test: [backend/start/src/test](file:///d:/projects/hospital-management-system/backend/start/src/test)

**Interfaces:**
- Consumes: Render environment variable `PORT`
- Produces: Dynamic port binding for Render web service

- [ ] **Step 1: Update server port configuration in application.yml**

In `backend/start/src/main/resources/application.yml`, update line 20:
```yaml
server:
  port: ${PORT:${SERVER_PORT:8081}}
```

- [ ] **Step 2: Run Maven backend test suite to verify no regressions**

Run command in `backend/` directory:
```bash
mvn test -pl start -am
```
Expected: `BUILD SUCCESS` with all tests passing.

- [ ] **Step 3: Commit Task 2**

```bash
git add backend/start/src/main/resources/application.yml
git commit -m "fix(backend): bind server port to PORT env var for Render compatibility"
```

---

### Task 3: Update Deployment Documentation

**Files:**
- Modify: [docs/10-deployment/docker.md](file:///d:/projects/hospital-management-system/docs/10-deployment/docker.md)

**Interfaces:**
- Consumes: New JVM runtime options
- Produces: Updated deployment documentation with Render & memory tuning details

- [ ] **Step 1: Add JVM Memory & Render Deployment section in docs/10-deployment/docker.md**

Update runtime documentation in `docs/10-deployment/docker.md` under Backend Dockerfile Stage 2 section to explain JVM memory limits (`-Xmx256m`, `-XX:+UseSerialGC`, `-XX:TieredStopAtLevel=1`) for 512MB RAM hosting environments like Render Free tier.

- [ ] **Step 2: Commit Task 3**

```bash
git add docs/10-deployment/docker.md
git commit -m "docs(deployment): document JVM memory tuning for 512MB container environments"
```
