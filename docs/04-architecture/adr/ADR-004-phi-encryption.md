# ADR-004: AES-GCM Patient Identity Encryption with SHA-256 Indexing

**Status:** Accepted
**Date:** 2026-04-15
**Deciders:** Architecture team

## Context
Vietnamese patient identities (CCCD/CMND national ID numbers) are PHI (Protected Health Information) and must never be stored in plaintext. However, the system needs to look up patients by their national ID for clinical workflows.

## Decision
Encrypt CCCD/CMND with AES-GCM (256-bit key) for storage, and index by SHA-256 hash for deterministic lookup.

## Rationale
- AES-GCM provides authenticated encryption (confidentiality + integrity)
- SHA-256 hash enables deterministic `findByCccdHash()` queries without decrypting
- Separate encryption key (`PATIENT_IDENTIFIER_SECRET`) from JWT secret for defense in depth
- Encryption/decryption handled by `PatientIdentifierProtector` in infrastructure layer
- Plaintext CCCD/CMND never persisted to database or logs

## Consequences
- ✅ PHI compliance — plaintext national IDs never stored
- ✅ Deterministic patient lookup by hashed identity
- ✅ Separate encryption key from JWT key
- ⚠️ Cannot search by partial CCCD (full match only via hash)
- ⚠️ Key rotation requires re-encryption of all patient records
