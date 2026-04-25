# Hospital Management System - API Contract

**Version:** 1.0.0
**Last Updated:** April 16, 2026
**Base URL:** `https://api.hospital.local/api/v1` (Production)
**Environment:** All endpoints require HTTPS in production

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Response Standards](#response-standards)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
   - [Patient Authentication](#patient-authentication)
   - [Doctor Management](#doctor-management)
   - [Departments](#departments)
   - [Appointments & Scheduling](#appointments--scheduling)
   - [Patient Management](#patient-management)
   - [Patient Portal](#patient-portal)
   - [Clinical Operations](#clinical-operations)
   - [Vital Signs](#vital-signs)
   - [Lab Results](#lab-results)
   - [Medical Records](#medical-records)
   - [Internal Assistant](#internal-assistant)
   - [Public Content](#public-content)
   - [Chatbot](#chatbot)
   - [AI Services](#ai-services)
   - [Inventory Management](#inventory-management)
   - [Finance](#finance)
   - [Admin - Users & Access](#admin---users--access)
   - [Admin - Operations](#admin---operations)
   - [Admin - Monitoring](#admin---monitoring)

---

## Overview

The Hospital Management System API provides comprehensive endpoints for managing patients, appointments, medical records, clinical operations, and administrative functions. The API follows REST principles with JSON payloads and semantic HTTP status codes.

### Key Features

- **Role-based Access Control** - Fine-grained authorization via Spring Security
- **JWT Authentication** - Stateless authentication with access and refresh tokens
- **Comprehensive Audit Trail** - All actions are logged for compliance
- **Production-Ready** - Implements security best practices and error handling
- **Pagination Support** - Large datasets support offset-based pagination
- **Resource-Oriented** - RESTful design with predictable endpoint patterns

---

## Authentication & Authorization

### Overview

The API uses JWT (JSON Web Token) based authentication with two-tier tokens:

- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), stored in HttpOnly secure cookies

### User Roles

| Role | Description | Endpoints |
|------|-------------|-----------|
| `ADMIN` | Full system access, user & operations management | All endpoints |
| `DOCTOR` | Clinical operations, patient records, appointments | Clinical, Appointments, Medical Records |
| `NURSE` | Clinical support, vital signs, patient check-in | Clinical, Vital Signs, Queue |
| `ACCOUNTANT` | Financial operations, invoicing, pricing | Finance, Pricing, Reports |
| `PATIENT` | Patient portal access only | Patient Portal, Medical History |

### Authentication Flow

#### 1. Staff Authentication (Admin, Doctor, Nurse, Accountant)

```
POST /auth/login
{
  "email": "doctor@hospital.com",
  "password": "SecurePassword123"
}

Response (200 OK):
{
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Dr. John Doe",
    "role": "DOCTOR",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresInSeconds": 900
    }
  },
  "message": "Authenticated successfully"
}

Set-Cookie: __host-hospital_refresh=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;
  HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800
```

#### 2. Patient Authentication (Portal Access)

```
POST /patient-auth/claim
{
  "cccd": "301234567890",
  "dateOfBirth": "1990-05-15",
  "email": "patient@email.com"
}

Response (200 OK):
{
  "data": {
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "fullName": "Jane Smith",
    "role": "PATIENT",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresInSeconds": 900
    }
  },
  "message": "Patient portal access activated"
}
```

### Token Usage

All authenticated requests must include the access token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Refresh

```
POST /auth/refresh
Content-Type: application/json

Request Body (optional - token from cookie if available):
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresInSeconds": 900
  },
  "message": "Access token refreshed"
}
```

---

## Response Standards

### Success Response Format

All successful requests return the following envelope:

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Example Resource",
    "createdAt": "2026-04-16T10:30:00Z",
    "updatedAt": "2026-04-16T10:30:00Z"
  },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2026-04-16T10:35:00Z"
  }
}
```

### Paginated Response Format

```json
{
  "data": [
    { "id": "uuid1", "name": "Item 1" },
    { "id": "uuid2", "name": "Item 2" }
  ],
  "message": "Items retrieved successfully",
  "meta": {
    "total": 150,
    "page": 0,
    "size": 20,
    "totalPages": 8,
    "timestamp": "2026-04-16T10:35:00Z"
  }
}
```

### HTTP Status Codes

| Code | Description | Use Case |
|------|-------------|----------|
| `200 OK` | Successful GET, PUT, PATCH | Resource retrieved or modified |
| `201 Created` | Successful POST | New resource created (includes Location header) |
| `204 No Content` | Successful DELETE | Resource deleted (no response body) |
| `400 Bad Request` | Validation failure | Invalid JSON, missing required fields |
| `401 Unauthorized` | Missing/invalid auth | No token or token expired |
| `403 Forbidden` | Insufficient permissions | User lacks required role |
| `404 Not Found` | Resource doesn't exist | Invalid ID or missing resource |
| `409 Conflict` | State conflict | Duplicate entry, invalid state change |
| `422 Unprocessable Entity` | Semantic validation failure | Valid JSON, invalid business logic |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests in time window |
| `500 Internal Server Error` | Unexpected server failure | Generic server error (never expose details) |
| `502 Bad Gateway` | Upstream service failure | Database or external service unavailable |
| `503 Service Unavailable` | Server overload | Retry with exponential backoff |

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "INVALID_FORMAT"
      },
      {
        "field": "age",
        "message": "Must be between 0 and 150",
        "code": "OUT_OF_RANGE"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-04-16T10:35:00Z",
    "path": "/api/v1/patients",
    "traceId": "f5b3c4d7-8e9a-11eb-8dcd-0242ac130003"
  }
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `TOKEN_EXPIRED` | 401 | Access token has expired, use refresh token |
| `REFRESH_TOKEN_INVALID` | 401 | Refresh token invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | User role lacks required permission |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource doesn't exist |
| `VALIDATION_ERROR` | 400 | One or more fields failed validation |
| `DUPLICATE_ENTRY` | 409 | Resource already exists (e.g., duplicate email) |
| `INVALID_STATE_TRANSITION` | 409 | Cannot transition resource to requested state |
| `CONFLICT` | 409 | Request conflicts with current resource state |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests, retry after delay |
| `INTERNAL_ERROR` | 500 | Unexpected server-side error |

---

## Rate Limiting

### Rate Limit Headers

All responses include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1713268500
```

### Rate Limiting Rules

| Endpoint Class | Limit | Window |
|----------------|-------|--------|
| Authentication (Login/Refresh) | 10 | Per 15 minutes |
| Public Endpoints | 100 | Per minute |
| Protected Endpoints | 1000 | Per hour |
| AI/Analysis Endpoints | 50 | Per hour |
| Admin Operations | 500 | Per hour |

### Rate Limit Exceeded Response

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}

HTTP Status: 429 Too Many Requests
Retry-After: 60
X-RateLimit-Reset: 1713268500
```

---

## API Endpoints

---

### Authentication

Base Path: `/api/v1/auth`

All staff (Admin, Doctor, Nurse, Accountant) use these endpoints for authentication.

#### POST /auth/login

Authenticate a staff member and obtain JWT tokens.

**Authentication:** None (Public)
**Authorization:** N/A

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Dr. John Doe",
    "role": "DOCTOR",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresInSeconds": 900
    }
  },
  "message": "Authenticated successfully"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

**cURL Example:**
```bash
curl -X POST https://api.hospital.local/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "doctor@hospital.com",
    "password": "SecurePassword123"
  }'
```

---

#### POST /auth/refresh

Refresh an expired access token using the refresh token.

**Authentication:** Optional (Bearer token or HttpOnly cookie)
**Authorization:** N/A

**Request Body (Optional):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresInSeconds": 900
  },
  "message": "Access token refreshed"
}
```

---

#### POST /auth/logout

Clear the refresh token and logout the user.

**Authentication:** Bearer token
**Authorization:** Any authenticated user

**Response (200 OK):**
```json
{
  "data": "Logged out",
  "message": "Logged out"
}
```

---

### Patient Authentication

Base Path: `/api/v1/patient-auth`

Patients claim or login to access the patient portal.

#### POST /patient-auth/claim

Register/activate a patient account using CCCD (ID) and personal information.

**Authentication:** None (Public)
**Authorization:** N/A

**Request Body:**
```json
{
  "cccd": "301234567890",
  "dateOfBirth": "1990-05-15",
  "email": "patient@email.com"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "fullName": "Jane Smith",
    "role": "PATIENT",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresInSeconds": 900
    }
  },
  "message": "Patient portal access activated"
}
```

---

#### POST /patient-auth/login

Authenticate a patient with email and password.

**Authentication:** None (Public)
**Authorization:** N/A

**Request Body:**
```json
{
  "email": "patient@email.com",
  "password": "PatientPassword123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "userId": "660e8400-e29b-41d4-a716-446655440001",
    "fullName": "Jane Smith",
    "role": "PATIENT",
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresInSeconds": 900
    }
  },
  "message": "Authenticated successfully"
}
```

---

#### POST /patient-auth/refresh

Refresh a patient's access token.

**Authentication:** Bearer token
**Authorization:** Patient role

**Response (200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresInSeconds": 900
  },
  "message": "Access token refreshed"
}
```

---

#### POST /patient-auth/logout

Logout a patient.

**Authentication:** Bearer token
**Authorization:** Patient role

**Response (200 OK):**
```json
{
  "data": "Logged out",
  "message": "Logged out"
}
```

---

### Doctor Management

Base Path: `/api/v1/doctors`

Retrieve doctor information and availability.

#### GET /doctors

List all active doctors with basic information.

**Authentication:** None (Public)
**Authorization:** N/A

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Dr. John Doe",
      "specialization": "Cardiology",
      "departmentId": "550e8400-e29b-41d4-a716-446655440001",
      "departmentName": "Cardiology Department",
      "qualifications": ["MD", "Board Certified"],
      "experienceYears": 10,
      "active": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "Dr. Jane Smith",
      "specialization": "Neurology",
      "departmentId": "550e8400-e29b-41d4-a716-446655440003",
      "departmentName": "Neurology Department",
      "qualifications": ["MD", "PhD in Neuroscience"],
      "experienceYears": 12,
      "active": true
    }
  ],
  "message": "Doctors retrieved successfully"
}
```

**cURL Example:**
```bash
curl https://api.hospital.local/api/v1/doctors
```

---

#### GET /doctors/{doctorId}

Get detailed information about a specific doctor.

**Authentication:** None (Public)
**Authorization:** N/A

**Path Parameters:**
- `doctorId` (UUID, required): Doctor unique identifier

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. John Doe",
    "specialization": "Cardiology",
    "bio": "Experienced cardiologist with 10 years of practice",
    "departmentId": "550e8400-e29b-41d4-a716-446655440001",
    "departmentName": "Cardiology Department",
    "qualifications": ["MD", "Board Certified in Cardiology"],
    "experienceYears": 10,
    "consultationFee": 50000,
    "active": true,
    "createdAt": "2025-01-15T08:00:00Z"
  },
  "message": "Doctor retrieved successfully"
}
```

**Response (404 Not Found):**
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Doctor not found"
  }
}
```

---

#### GET /doctors/{doctorId}/slots

Get available time slots for a doctor on a specific date.

**Authentication:** None (Public)
**Authorization:** N/A

**Path Parameters:**
- `doctorId` (UUID, required): Doctor unique identifier

**Query Parameters:**
- `date` (LocalDate, required): Date in ISO format (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "doctorId": "550e8400-e29b-41d4-a716-446655440000",
      "startTime": "08:00",
      "endTime": "08:30",
      "status": "AVAILABLE",
      "date": "2026-04-20"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "doctorId": "550e8400-e29b-41d4-a716-446655440000",
      "startTime": "08:30",
      "endTime": "09:00",
      "status": "AVAILABLE",
      "date": "2026-04-20"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "doctorId": "550e8400-e29b-41d4-a716-446655440000",
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "BOOKED",
      "date": "2026-04-20"
    }
  ],
  "message": "Doctor slots retrieved successfully"
}
```

**cURL Example:**
```bash
curl 'https://api.hospital.local/api/v1/doctors/550e8400-e29b-41d4-a716-446655440000/slots?date=2026-04-20'
```

---

### Departments

Base Path: `/api/v1/departments`

Retrieve department information and doctors.

#### GET /departments

List all active departments.

**Authentication:** None (Public)
**Authorization:** N/A

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Cardiology",
      "description": "Heart and cardiovascular diseases",
      "doctorCount": 5,
      "active": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Neurology",
      "description": "Nervous system and brain disorders",
      "doctorCount": 3,
      "active": true
    }
  ],
  "message": "Departments retrieved successfully"
}
```

---

#### GET /departments/{departmentId}

Get department detail with doctors.

**Authentication:** None (Public)
**Authorization:** N/A

**Path Parameters:**
- `departmentId` (UUID, required): Department unique identifier

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Cardiology",
    "description": "Heart and cardiovascular diseases",
    "contactPhone": "+84-123-456-789",
    "operatingHours": "08:00-17:00",
    "doctors": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Dr. John Doe",
        "specialization": "Cardiology",
        "qualifications": ["MD", "Board Certified"]
      }
    ]
  },
  "message": "Department retrieved successfully"
}
```

---

#### GET /departments/{departmentId}/doctors

Get list of doctors in a department.

**Authentication:** None (Public)
**Authorization:** N/A

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Dr. John Doe",
      "specialization": "Cardiology",
      "qualifications": ["MD", "Board Certified"]
    }
  ],
  "message": "Department doctors retrieved successfully"
}
```

---

### Appointments & Scheduling

Base Path: `/api/v1/appointments`

Manage appointment creation, listing, and updates.

#### POST /appointments

Create a new appointment booking.

**Authentication:** None (Public)
**Authorization:** N/A

**Request Body:**
```json
{
  "patientCCCD": "301234567890",
  "patientFullName": "Jane Smith",
  "patientEmail": "jane@email.com",
  "patientPhone": "+84-987-654-321",
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "scheduledAt": "2026-04-20T08:00:00Z",
  "reason": "Routine checkup",
  "symptoms": "Occasional chest discomfort"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "patientCCCD": "301234567890",
    "patientFullName": "Jane Smith",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorName": "Dr. John Doe",
    "scheduledAt": "2026-04-20T08:00:00Z",
    "reason": "Routine checkup",
    "status": "SCHEDULED",
    "createdAt": "2026-04-16T10:30:00Z"
  },
  "message": "Appointment created successfully"
}
```

**cURL Example:**
```bash
curl -X POST https://api.hospital.local/api/v1/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patientCCCD": "301234567890",
    "patientFullName": "Jane Smith",
    "patientEmail": "jane@email.com",
    "patientPhone": "+84-987-654-321",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "scheduledAt": "2026-04-20T08:00:00Z",
    "reason": "Routine checkup"
  }'
```

---

#### GET /appointments

List appointments with optional filtering. Doctors see only their appointments by default.

**Authentication:** Bearer token
**Authorization:** DOCTOR, NURSE, ADMIN

**Query Parameters:**
- `status` (AppointmentStatus, optional): Filter by status (SCHEDULED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW)
- `doctorId` (UUID, optional): Filter by doctor (ADMIN only, defaults to authenticated user if DOCTOR)
- `date` (LocalDate, optional): Filter by specific date
- `page` (int, default: 0): Page number for pagination
- `size` (int, default: 20): Items per page

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "patientFullName": "Jane Smith",
      "doctorName": "Dr. John Doe",
      "scheduledAt": "2026-04-20T08:00:00Z",
      "status": "SCHEDULED",
      "reason": "Routine checkup"
    }
  ],
  "message": "Appointments retrieved successfully",
  "meta": {
    "total": 45,
    "page": 0,
    "size": 20,
    "totalPages": 3
  }
}
```

---

#### GET /appointments/today

List all appointments for today (nurse view).

**Authentication:** Bearer token
**Authorization:** NURSE

**Query Parameters:**
- `date` (LocalDate, optional): Defaults to today if not provided

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "patientFullName": "Jane Smith",
      "doctorName": "Dr. John Doe",
      "room": "Room 101",
      "scheduledAt": "2026-04-16T08:00:00Z",
      "status": "CHECKED_IN",
      "notes": "Patient arrived early"
    }
  ],
  "message": "Today's appointments retrieved successfully"
}
```

---

#### GET /appointments/{appointmentId}

Get detailed appointment information (doctor use).

**Authentication:** Bearer token
**Authorization:** DOCTOR (own appointments)

**Path Parameters:**
- `appointmentId` (UUID, required): Appointment unique identifier

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "patientCCCD": "301234567890",
    "patientFullName": "Jane Smith",
    "patientAge": 30,
    "doctorId": "550e8400-e29b-41d4-a716-446655440000",
    "doctorName": "Dr. John Doe",
    "scheduledAt": "2026-04-20T08:00:00Z",
    "checkedInAt": null,
    "completedAt": null,
    "room": "Room 101",
    "status": "SCHEDULED",
    "reason": "Routine checkup",
    "symptoms": "Occasional chest discomfort",
    "notes": null,
    "vitalSigns": null,
    "labResults": [],
    "medicalHistory": {
      "allergies": ["Penicillin"],
      "medications": ["Metformin 500mg"],
      "pastConditions": ["Type 2 Diabetes"]
    }
  },
  "message": "Appointment detail retrieved successfully"
}
```

---

#### PUT /appointments/{appointmentId}

Update appointment metadata (notes, room assignment).

**Authentication:** Bearer token
**Authorization:** DOCTOR, NURSE, ADMIN

**Path Parameters:**
- `appointmentId` (UUID, required): Appointment unique identifier

**Request Body:**
```json
{
  "room": "Room 102",
  "notes": "Patient has history of hypertension"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "patientFullName": "Jane Smith",
    "doctorName": "Dr. John Doe",
    "scheduledAt": "2026-04-20T08:00:00Z",
    "room": "Room 102",
    "notes": "Patient has history of hypertension",
    "status": "SCHEDULED"
  },
  "message": "Appointment updated successfully"
}
```

---

#### DELETE /appointments/{appointmentId}

Cancel an appointment.

**Authentication:** Bearer token
**Authorization:** ADMIN, NURSE

**Path Parameters:**
- `appointmentId` (UUID, required): Appointment unique identifier

**Response (200 OK):**
```json
{
  "data": null,
  "message": "Appointment cancelled"
}
```

---

#### POST /appointments/{appointmentId}/checkin

Check in a patient for their appointment.

**Authentication:** Bearer token
**Authorization:** NURSE

**Path Parameters:**
- `appointmentId` (UUID, required): Appointment unique identifier

**Request Body:**
```json
{
  "checkedInAt": "2026-04-20T07:55:00Z"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "patientFullName": "Jane Smith",
    "status": "CHECKED_IN",
    "checkedInAt": "2026-04-20T07:55:00Z",
    "scheduledAt": "2026-04-20T08:00:00Z"
  },
  "message": "Patient checked in successfully"
}
```

---

#### PUT /appointments/{appointmentId}/status

Update appointment status (doctor use).

**Authentication:** Bearer token
**Authorization:** DOCTOR

**Path Parameters:**
- `appointmentId` (UUID, required): Appointment unique identifier

**Request Body:**
```json
{
  "status": "COMPLETED"
}
```

**Status Values:** `SCHEDULED`, `CHECKED_IN`, `COMPLETED`, `CANCELLED`, `NO_SHOW`

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440100",
    "status": "COMPLETED",
    "completedAt": "2026-04-20T08:30:00Z"
  },
  "message": "Appointment status updated successfully"
}
```

---

#### POST /appointments/{appointmentId}/vital-signs

Record vital signs during appointment (nurse).

**Authentication:** Bearer token
**Authorization:** NURSE

**Path Parameters:**
- `appointmentId` (UUID, required): Appointment unique identifier

**Request Body:**
```json
{
  "temperature": 37.2,
  "systolicBP": 120,
  "diastolicBP": 80,
  "heartRate": 72,
  "respiratoryRate": 16,
  "spO2": 98,
  "weight": 70.5,
  "height": 175,
  "notes": "Patient appears healthy"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "temperature": 37.2,
    "systolicBP": 120,
    "diastolicBP": 80,
    "heartRate": 72,
    "respiratoryRate": 16,
    "spO2": 98,
    "weight": 70.5,
    "height": 175,
    "bmi": 23.0,
    "recordedAt": "2026-04-20T08:05:00Z"
  },
  "message": "Vital signs recorded successfully"
}
```

---

#### GET /appointments/{appointmentId}/vital-signs

Get vital signs for an appointment.

**Authentication:** Bearer token
**Authorization:** DOCTOR, NURSE

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "temperature": 37.2,
    "systolicBP": 120,
    "diastolicBP": 80,
    "heartRate": 72,
    "respiratoryRate": 16,
    "spO2": 98,
    "weight": 70.5,
    "height": 175,
    "bmi": 23.0,
    "recordedAt": "2026-04-20T08:05:00Z"
  },
  "message": "Vital signs retrieved successfully"
}
```

---

#### POST /appointments/{appointmentId}/follow-up

Create a follow-up appointment.

**Authentication:** Bearer token
**Authorization:** DOCTOR

**Path Parameters:**
- `appointmentId` (UUID, required): Current appointment identifier

**Request Body:**
```json
{
  "scheduledAt": "2026-05-20T08:00:00Z",
  "reason": "Follow-up for treatment progress"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440101",
    "originalAppointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "scheduledAt": "2026-05-20T08:00:00Z",
    "reason": "Follow-up for treatment progress",
    "status": "SCHEDULED"
  },
  "message": "Follow-up appointment created successfully"
}
```

---

### Patient Management

Base Path: `/api/v1/patients`

Retrieve patient information (doctor use).

#### GET /patients/{cccd}/history

Get patient medical history.

**Authentication:** Bearer token
**Authorization:** DOCTOR

**Path Parameters:**
- `cccd` (string, required): Patient CCCD (ID number)

**Response (200 OK):**
```json
{
  "data": {
    "patientId": "660e8400-e29b-41d4-a716-446655440001",
    "cccd": "301234567890",
    "fullName": "Jane Smith",
    "dateOfBirth": "1990-05-15",
    "gender": "FEMALE",
    "phone": "+84-987-654-321",
    "email": "jane@email.com",
    "allergies": ["Penicillin", "Shellfish"],
    "pastMedicalConditions": [
      {
        "condition": "Type 2 Diabetes",
        "diagnosedYear": 2015,
        "status": "Managed"
      }
    ],
    "currentMedications": [
      {
        "name": "Metformin",
        "dosage": "500mg",
        "frequency": "Twice daily"
      }
    ],
    "familyHistory": "Father had hypertension",
    "lastVisit": "2026-03-15",
    "totalVisits": 12
  },
  "message": "Patient history retrieved successfully"
}
```

---

### Patient Portal

Base Path: `/api/v1/patient-portal`

Patient-specific endpoints for accessing their health information.

**Authentication:** Bearer token
**Authorization:** PATIENT

#### GET /patient-portal/overview

Get patient portal overview dashboard.

**Response (200 OK):**
```json
{
  "data": {
    "patientId": "660e8400-e29b-41d4-a716-446655440001",
    "fullName": "Jane Smith",
    "upcomingAppointments": 2,
    "pendingLabResults": 1,
    "newMessages": 3,
    "lastVisit": "2026-03-15T10:30:00Z",
    "healthSummary": "Overall healthy with managed diabetes"
  },
  "message": "Overview retrieved successfully"
}
```

---

#### GET /patient-portal/appointments

Get patient's appointments.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "doctorName": "Dr. John Doe",
      "departmentName": "Cardiology",
      "scheduledAt": "2026-04-20T08:00:00Z",
      "status": "SCHEDULED",
      "reason": "Routine checkup"
    }
  ],
  "message": "Appointments retrieved successfully"
}
```

---

#### GET /patient-portal/lab-results

Get patient's lab results.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "testName": "Blood Glucose",
      "result": "120 mg/dL",
      "referenceRange": "70-100 mg/dL",
      "status": "ABNORMAL",
      "testDate": "2026-04-10T09:00:00Z"
    }
  ],
  "message": "Lab results retrieved successfully"
}
```

---

#### GET /patient-portal/messages

Get patient message threads.

**Response (200 OK):**
```json
{
  "data": [
    {
      "threadId": "550e8400-e29b-41d4-a716-446655440400",
      "doctorName": "Dr. John Doe",
      "subject": "Follow-up on test results",
      "lastMessage": "Your glucose levels are stable",
      "lastMessageAt": "2026-04-15T14:30:00Z",
      "unreadCount": 2
    }
  ],
  "message": "Messages retrieved successfully"
}
```

---

#### GET /patient-portal/profile

Get patient profile information.

**Response (200 OK):**
```json
{
  "data": {
    "patientId": "660e8400-e29b-41d4-a716-446655440001",
    "fullName": "Jane Smith",
    "email": "jane@email.com",
    "phone": "+84-987-654-321",
    "dateOfBirth": "1990-05-15",
    "gender": "FEMALE",
    "address": "123 Main Street, Hanoi",
    "cccd": "301234567890",
    "allergies": ["Penicillin"],
    "emergencyContact": "John Smith (+84-123-456-789)"
  },
  "message": "Profile retrieved successfully"
}
```

---

#### PUT /patient-portal/profile

Update patient profile information.

**Request Body:**
```json
{
  "phone": "+84-987-654-322",
  "address": "124 Main Street, Hanoi",
  "emergencyContact": "Jane Doe (+84-111-222-333)"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "patientId": "660e8400-e29b-41d4-a716-446655440001",
    "fullName": "Jane Smith",
    "email": "jane@email.com",
    "phone": "+84-987-654-322",
    "address": "124 Main Street, Hanoi",
    "cccd": "301234567890"
  },
  "message": "Profile updated successfully"
}
```

---

### Clinical Operations

Base Path: `/api/v1/me` (Doctor Schedule), `/api/v1/queue` (Nurse Queue)

#### GET /me/schedule

Get doctor's schedule for a specific date or week.

**Authentication:** Bearer token
**Authorization:** DOCTOR

**Query Parameters:**
- `date` (string, optional): Specific date (YYYY-MM-DD) or "today"
- `week` (string, optional): ISO week format (YYYY-Www)

Either `date` or `week` must be provided, not both.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "patientFullName": "Jane Smith",
      "scheduledAt": "2026-04-16T08:00:00Z",
      "room": "Room 101",
      "status": "SCHEDULED",
      "reason": "Routine checkup"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "patientFullName": "John Anderson",
      "scheduledAt": "2026-04-16T08:30:00Z",
      "room": "Room 102",
      "status": "CHECKED_IN",
      "reason": "Follow-up"
    }
  ],
  "message": "Schedule retrieved successfully"
}
```

**cURL Example:**
```bash
curl -H "Authorization: Bearer <token>" \
  'https://api.hospital.local/api/v1/me/schedule?date=2026-04-16'
```

---

#### GET /queue/today

Get patient queue for today (nurse view).

**Authentication:** Bearer token
**Authorization:** NURSE

**Query Parameters:**
- `date` (LocalDate, optional): Defaults to today

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440100",
      "patientFullName": "Jane Smith",
      "doctorName": "Dr. John Doe",
      "scheduledAt": "2026-04-16T08:00:00Z",
      "checkedInAt": "2026-04-16T07:55:00Z",
      "waitTimeMinutes": 5,
      "status": "CHECKED_IN"
    }
  ],
  "message": "Queue retrieved successfully"
}
```

---

### Vital Signs

Base Path: `/api/v1/vital-signs`

Manage vital signs records.

**Authentication:** Bearer token
**Authorization:** DOCTOR, NURSE, ADMIN

#### POST /vital-signs

Create vital signs record.

**Request Body:**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
  "temperature": 37.2,
  "systolicBP": 120,
  "diastolicBP": 80,
  "heartRate": 72,
  "respiratoryRate": 16,
  "spO2": 98,
  "weight": 70.5,
  "height": 175,
  "notes": "Patient is calm and cooperative"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "temperature": 37.2,
    "systolicBP": 120,
    "diastolicBP": 80,
    "heartRate": 72,
    "bmi": 23.0,
    "recordedAt": "2026-04-16T08:05:00Z"
  },
  "message": "Vital signs recorded successfully"
}
```

---

#### GET /vital-signs/{appointmentId}

Get vital signs for an appointment.

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "temperature": 37.2,
    "systolicBP": 120,
    "diastolicBP": 80,
    "heartRate": 72,
    "bmi": 23.0,
    "recordedAt": "2026-04-16T08:05:00Z"
  },
  "message": "Vital signs retrieved successfully"
}
```

---

#### PUT /vital-signs/{vitalSignId}

Update vital signs record.

**Request Body:**
```json
{
  "temperature": 37.3,
  "systolicBP": 121,
  "diastolicBP": 81
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440200",
    "temperature": 37.3,
    "systolicBP": 121,
    "diastolicBP": 81
  },
  "message": "Vital signs updated successfully"
}
```

---

#### DELETE /vital-signs/{vitalSignId}

Delete vital signs record.

**Response (204 No Content):**
No body returned.

---

### Lab Results

Base Path: `/api/v1`

Manage laboratory test results.

**Authentication:** Bearer token
**Authorization:** DOCTOR, NURSE, ADMIN

#### POST /lab-results

Create lab result record.

**Request Body:**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
  "testName": "Blood Glucose",
  "result": "120 mg/dL",
  "referenceRange": "70-100 mg/dL",
  "unit": "mg/dL",
  "status": "ABNORMAL",
  "notes": "Patient fasting for 8 hours"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440300",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "testName": "Blood Glucose",
    "result": "120 mg/dL",
    "status": "ABNORMAL",
    "recordedAt": "2026-04-16T09:30:00Z"
  },
  "message": "Lab result created successfully"
}
```

---

#### GET /lab-results/{resultId}

Get specific lab result.

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440300",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "testName": "Blood Glucose",
    "result": "120 mg/dL",
    "referenceRange": "70-100 mg/dL",
    "unit": "mg/dL",
    "status": "ABNORMAL",
    "recordedAt": "2026-04-16T09:30:00Z"
  },
  "message": "Lab result retrieved successfully"
}
```

---

#### GET /appointments/{appointmentId}/lab-results

Get all lab results for an appointment.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440300",
      "testName": "Blood Glucose",
      "result": "120 mg/dL",
      "status": "ABNORMAL"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440301",
      "testName": "Hemoglobin A1c",
      "result": "7.2%",
      "status": "ABNORMAL"
    }
  ],
  "message": "Lab results retrieved successfully"
}
```

---

#### DELETE /lab-results/{resultId}

Delete lab result.

**Response (204 No Content):**
No body returned.

---

### Medical Records

Base Path: `/api/v1/medical-records`

Create and retrieve medical records and prescriptions.

**Authentication:** Bearer token
**Authorization:** DOCTOR

#### POST /medical-records

Create medical record with prescription.

**Request Body:**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
  "diagnosis": "Type 2 Diabetes with hypertension",
  "notes": "Patient compliance is good",
  "prescriptions": [
    {
      "medicationName": "Metformin",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "30 days",
      "instructions": "Take with meals"
    },
    {
      "medicationName": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Once daily",
      "duration": "Ongoing",
      "instructions": "Take in the morning"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440400",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "diagnosis": "Type 2 Diabetes with hypertension",
    "notes": "Patient compliance is good",
    "prescriptions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440401",
        "medicationName": "Metformin",
        "dosage": "500mg",
        "frequency": "Twice daily"
      }
    ],
    "createdAt": "2026-04-16T09:45:00Z"
  },
  "message": "Medical record created successfully"
}
```

---

#### POST /medical-records/preview.pdf

Preview prescription as PDF.

**Request Body:** Same as POST /medical-records

**Response (200 OK):**
```
Content-Type: application/pdf
Content-Disposition: inline; filename="prescription_preview.pdf"

[PDF binary content]
```

---

#### GET /medical-records/{recordId}/prescription.pdf

Download prescription PDF.

**Response (200 OK):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="prescription_20260416.pdf"

[PDF binary content]
```

---

### Internal Assistant

Base Path: `/api/v1/internal-assistant`

AI-powered clinical assistant for doctors and nurses.

**Authentication:** Bearer token
**Authorization:** DOCTOR, NURSE, ADMIN

#### GET /internal-assistant/sessions/current

Get or create a session with the internal assistant.

**Query Parameters:**
- `mode` (string, required): Session mode ("PATIENT_CASE", "SYMPTOM_ANALYSIS", "MEDICATION_GUIDE", "CLINICAL_RESEARCH")
- `patientId` (UUID, optional): Patient UUID
- `appointmentId` (UUID, optional): Appointment UUID
- `sessionId` (UUID, optional): Existing session to resume

**Response (200 OK):**
```json
{
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440500",
    "mode": "PATIENT_CASE",
    "patientId": "660e8400-e29b-41d4-a716-446655440001",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "startedAt": "2026-04-16T10:00:00Z",
    "context": "Patient presenting with chest discomfort"
  },
  "message": "Session created successfully"
}
```

---

#### POST /internal-assistant/messages

Send message to assistant and get response.

**Request Body:**
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440500",
  "message": "What are the differential diagnoses for chest discomfort?",
  "patientId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "messageId": "550e8400-e29b-41d4-a716-446655440501",
    "sessionId": "550e8400-e29b-41d4-a716-446655440500",
    "userMessage": "What are the differential diagnoses for chest discomfort?",
    "assistantResponse": "Based on the patient's symptoms and presentation, differential diagnoses include...",
    "confidence": 0.92,
    "citations": [
      {
        "source": "ICD-10 R07.9",
        "text": "Chest pain, unspecified"
      }
    ],
    "timestamp": "2026-04-16T10:05:00Z"
  },
  "message": "Assistant response generated successfully"
}
```

---

#### POST /internal-assistant/messages/{messageId}/feedback

Submit feedback on assistant response.

**Request Body:**
```json
{
  "helpful": true,
  "accurate": true,
  "feedbackText": "Response was clinically appropriate and well-sourced"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "feedbackId": "550e8400-e29b-41d4-a716-446655440502",
    "messageId": "550e8400-e29b-41d4-a716-446655440501",
    "helpful": true,
    "accurate": true,
    "timestamp": "2026-04-16T10:06:00Z"
  },
  "message": "Feedback recorded successfully"
}
```

---

### Public Content

Base Path: `/api/v1`

Retrieve public hospital information.

**Authentication:** None (Public)
**Authorization:** N/A

#### GET /content/home

Get homepage content.

**Response (200 OK):**
```json
{
  "data": {
    "hospitalName": "City Medical Center",
    "description": "Leading healthcare provider in the region",
    "departments": 15,
    "doctors": 120,
    "aboutUs": "Founded in 1995, we have been serving the community...",
    "contactPhone": "+84-24-1234-5678",
    "contactEmail": "info@hospital.com",
    "address": "100 Medical Avenue, Hanoi"
  },
  "message": "Home content retrieved successfully"
}
```

---

#### GET /news

Get news articles.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440600",
      "title": "New Cardiology Department Opens",
      "excerpt": "We are proud to announce...",
      "content": "Full article content here...",
      "publishedAt": "2026-04-10T10:00:00Z",
      "author": "Admin",
      "featured": true
    }
  ],
  "message": "News articles retrieved successfully"
}
```

---

### Chatbot

Base Path: `/api/v1/chatbot`

General-purpose chatbot for public inquiries.

**Authentication:** None (Public)
**Authorization:** N/A

#### POST /chatbot/messages

Send message to public chatbot.

**Request Body:**
```json
{
  "message": "What are your operating hours?"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "userMessage": "What are your operating hours?",
    "botResponse": "Our hospital operates from 08:00 AM to 10:00 PM daily. Emergency services are available 24/7.",
    "timestamp": "2026-04-16T10:00:00Z"
  },
  "message": "Chatbot response generated successfully"
}
```

---

### AI Services

Base Path: `/api/v1/ai`

AI-powered medical analysis services.

**Authentication:** None (Public for symptom analysis)
**Authorization:** N/A

#### POST /ai/analyze-symptoms

Analyze symptoms and get preliminary information.

**Request Body:**
```json
{
  "symptoms": "Chest discomfort, shortness of breath, palpitations",
  "duration": "2 days",
  "severity": "MODERATE"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "inputSymptoms": "Chest discomfort, shortness of breath, palpitations",
    "analysis": "The combination of symptoms warrants immediate medical attention...",
    "possibleConditions": [
      {
        "condition": "Angina",
        "likelihood": 0.75,
        "recommendation": "Seek immediate medical evaluation"
      },
      {
        "condition": "Anxiety",
        "likelihood": 0.45,
        "recommendation": "Consider psychological evaluation"
      }
    ],
    "nextSteps": "Schedule appointment with cardiologist",
    "urgency": "HIGH",
    "disclaimer": "This is not a diagnosis. Please consult a healthcare professional."
  },
  "message": "Symptom analysis completed"
}
```

---

### Inventory Management

Base Path: `/api/v1/inventory`

Manage medical inventory and supplies.

**Authentication:** Bearer token
**Authorization:** ACCOUNTANT, ADMIN

#### GET /inventory/items

List inventory items.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440700",
      "itemName": "Disposable Gloves (Box)",
      "category": "PPE",
      "quantity": 500,
      "unit": "Box",
      "costPerUnit": 50000,
      "active": true
    }
  ],
  "message": "Inventory items retrieved successfully"
}
```

---

#### POST /inventory/items

Create inventory item.

**Request Body:**
```json
{
  "itemName": "Surgical Masks (Box)",
  "category": "PPE",
  "unit": "Box",
  "costPerUnit": 150000,
  "notes": "Type N95"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440701",
    "itemName": "Surgical Masks (Box)",
    "category": "PPE",
    "unit": "Box",
    "costPerUnit": 150000,
    "quantity": 0
  },
  "message": "Inventory item created successfully"
}
```

---

#### PUT /inventory/items/{itemId}

Update inventory item.

**Request Body:**
```json
{
  "itemName": "Surgical Masks (Box)",
  "costPerUnit": 140000
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440701",
    "itemName": "Surgical Masks (Box)",
    "costPerUnit": 140000
  },
  "message": "Inventory item updated successfully"
}
```

---

#### DELETE /inventory/items/{itemId}

Delete inventory item.

**Response (204 No Content):**
No body returned.

---

#### GET /inventory/lots

List inventory lots.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440702",
      "itemId": "550e8400-e29b-41d4-a716-446655440700",
      "lotNumber": "GLV-2026-001",
      "quantity": 500,
      "expiryDate": "2027-04-16",
      "costPerUnit": 50000
    }
  ],
  "message": "Inventory lots retrieved successfully"
}
```

---

#### POST /inventory/lots

Create inventory lot.

**Request Body:**
```json
{
  "itemId": "550e8400-e29b-41d4-a716-446655440700",
  "lotNumber": "GLV-2026-002",
  "quantity": 300,
  "expiryDate": "2027-04-16",
  "costPerUnit": 50000
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440703",
    "lotNumber": "GLV-2026-002",
    "quantity": 300,
    "expiryDate": "2027-04-16"
  },
  "message": "Inventory lot created successfully"
}
```

---

#### GET /inventory/movements

List inventory movements.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440704",
      "itemId": "550e8400-e29b-41d4-a716-446655440700",
      "lotId": "550e8400-e29b-41d4-a716-446655440702",
      "type": "USAGE",
      "quantity": 50,
      "department": "Emergency",
      "notes": "Daily consumption",
      "recordedAt": "2026-04-16T08:00:00Z"
    }
  ],
  "message": "Inventory movements retrieved successfully"
}
```

---

#### POST /inventory/movements

Record inventory movement.

**Request Body:**
```json
{
  "itemId": "550e8400-e29b-41d4-a716-446655440700",
  "lotId": "550e8400-e29b-41d4-a716-446655440702",
  "type": "USAGE",
  "quantity": 50,
  "department": "Emergency",
  "notes": "Daily consumption"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440705",
    "itemId": "550e8400-e29b-41d4-a716-446655440700",
    "type": "USAGE",
    "quantity": 50,
    "recordedAt": "2026-04-16T08:15:00Z"
  },
  "message": "Inventory movement recorded successfully"
}
```

---

### Finance

#### Invoices

Base Path: `/api/v1/invoices`

Manage patient invoices and payments.

**Authentication:** Bearer token
**Authorization:** ACCOUNTANT, ADMIN

##### GET /invoices

List invoices with optional status filter.

**Query Parameters:**
- `status` (InvoiceStatus, optional): Filter by status (DRAFT, ISSUED, PAID, PARTIAL, OVERDUE, VOID)

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440800",
      "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
      "patientName": "Jane Smith",
      "totalAmount": 500000,
      "amountPaid": 0,
      "status": "ISSUED",
      "dueDate": "2026-05-16",
      "issuedAt": "2026-04-16T11:00:00Z"
    }
  ],
  "message": "Invoices retrieved successfully"
}
```

---

##### POST /invoices

Create invoice from appointment.

**Request Body:**
```json
{
  "appointmentId": "550e8400-e29b-41d4-a716-446655440100"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440800",
    "appointmentId": "550e8400-e29b-41d4-a716-446655440100",
    "patientName": "Jane Smith",
    "totalAmount": 500000,
    "status": "ISSUED",
    "issuedAt": "2026-04-16T11:00:00Z"
  },
  "message": "Invoice created"
}
```

---

##### POST /invoices/{invoiceId}/payments

Record payment for invoice.

**Request Body:**
```json
{
  "paymentMethod": "CASH"
}
```

**Payment Methods:** `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`, `INSURANCE`

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440800",
    "amountPaid": 500000,
    "totalAmount": 500000,
    "status": "PAID",
    "lastPaymentAt": "2026-04-16T11:15:00Z"
  },
  "message": "Payment captured"
}
```

---

##### POST /invoices/{invoiceId}/void

Void an invoice (mark as cancelled).

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440800",
    "status": "VOID",
    "voidedAt": "2026-04-16T11:20:00Z"
  },
  "message": "Invoice voided"
}
```

---

#### Pricing

Base Path: `/api/v1/pricing`

Manage service pricing.

**Authentication:** Bearer token
**Authorization:** ACCOUNTANT, ADMIN

##### GET /pricing

List all pricing rules.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440900",
      "serviceName": "Doctor Consultation",
      "amount": 500000,
      "currency": "VND",
      "active": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440901",
      "serviceName": "Lab Test - Blood Glucose",
      "amount": 150000,
      "currency": "VND",
      "active": true
    }
  ],
  "message": "Pricing retrieved successfully"
}
```

---

##### POST /pricing

Create pricing rule.

**Request Body:**
```json
{
  "serviceName": "X-Ray",
  "amount": 300000,
  "currency": "VND"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440902",
    "serviceName": "X-Ray",
    "amount": 300000,
    "currency": "VND"
  },
  "message": "Pricing rule created"
}
```

---

##### PUT /pricing/{pricingId}

Update pricing rule.

**Request Body:**
```json
{
  "amount": 320000
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440902",
    "serviceName": "X-Ray",
    "amount": 320000
  },
  "message": "Pricing rule updated"
}
```

---

#### Revenue Reports

Base Path: `/api/v1/reports/revenue`

Financial reporting endpoints.

**Authentication:** Bearer token
**Authorization:** ACCOUNTANT, ADMIN

##### GET /reports/revenue/daily

Get daily revenue report.

**Query Parameters:**
- `date` (LocalDate, required): Report date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "data": {
    "date": "2026-04-16",
    "totalRevenue": 2500000,
    "totalTransactions": 15,
    "byPaymentMethod": {
      "CASH": 1000000,
      "CARD": 1500000
    },
    "byService": {
      "Consultation": 1000000,
      "Lab Tests": 750000,
      "Imaging": 750000
    }
  },
  "message": "Daily revenue report retrieved"
}
```

---

##### GET /reports/revenue/monthly

Get monthly revenue report.

**Query Parameters:**
- `month` (string, required): Month in format YYYY-MM

**Response (200 OK):**
```json
{
  "data": {
    "month": "2026-04",
    "totalRevenue": 45000000,
    "averageDailyRevenue": 1500000,
    "totalTransactions": 300,
    "dailyBreakdown": [
      {
        "date": "2026-04-01",
        "revenue": 1500000,
        "transactions": 10
      }
    ]
  },
  "message": "Monthly revenue report retrieved"
}
```

---

### Admin - Users & Access

Base Path: `/api/v1/admin/users`

Staff user management.

**Authentication:** Bearer token
**Authorization:** ADMIN

#### GET /admin/users

List all staff users.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "doctor@hospital.com",
      "fullName": "Dr. John Doe",
      "role": "DOCTOR",
      "active": true,
      "createdAt": "2025-01-15"
    }
  ],
  "message": "Users retrieved successfully"
}
```

---

#### GET /admin/users/{userId}

Get specific user details.

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "doctor@hospital.com",
    "fullName": "Dr. John Doe",
    "role": "DOCTOR",
    "department": "Cardiology",
    "phone": "+84-987-654-321",
    "active": true,
    "lastLogin": "2026-04-16T09:30:00Z"
  },
  "message": "User retrieved successfully"
}
```

---

#### POST /admin/users

Create new staff user.

**Request Body:**
```json
{
  "email": "nurse@hospital.com",
  "fullName": "Nurse Jane",
  "password": "SecurePassword123",
  "role": "NURSE",
  "department": "Emergency",
  "phone": "+84-111-222-333"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "email": "nurse@hospital.com",
    "fullName": "Nurse Jane",
    "role": "NURSE",
    "active": true
  },
  "message": "User created"
}
```

---

#### PUT /admin/users/{userId}

Update user details.

**Request Body:**
```json
{
  "fullName": "Dr. John Smith",
  "phone": "+84-123-456-789",
  "department": "Cardiology"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Dr. John Smith",
    "phone": "+84-123-456-789"
  },
  "message": "User updated"
}
```

---

#### DELETE /admin/users/{userId}

Soft-delete (deactivate) user.

**Response (200 OK):**
```json
{
  "data": null,
  "message": "User deactivated"
}
```

---

#### POST /admin/users/{userId}/activate

Reactivate deactivated user.

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "active": true
  },
  "message": "User activated"
}
```

---

#### PUT /admin/users/{userId}/role

Change user role.

**Request Body:**
```json
{
  "role": "NURSE"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role": "NURSE"
  },
  "message": "Role updated"
}
```

---

### Admin - Operations

#### Rooms

Base Path: `/api/v1/admin/rooms`

**Authentication:** Bearer token
**Authorization:** ADMIN

##### GET /admin/rooms

List all rooms.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "number": "101",
      "name": "Cardiology Exam Room",
      "department": "Cardiology",
      "status": "READY",
      "capacity": 4,
      "active": true
    }
  ],
  "message": "Rooms retrieved successfully"
}
```

---

##### POST /admin/rooms

Create room.

**Request Body:**
```json
{
  "number": "201",
  "name": "Surgery Room A",
  "department": "Surgery",
  "capacity": 8
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "number": "201",
    "name": "Surgery Room A",
    "status": "READY"
  },
  "message": "Room created"
}
```

---

##### PUT /admin/rooms/{roomId}

Update room details.

**Request Body:**
```json
{
  "name": "Cardiology Exam Room A",
  "capacity": 5
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Cardiology Exam Room A",
    "capacity": 5
  },
  "message": "Room updated"
}
```

---

##### PUT /admin/rooms/{roomId}/status

Update room operational status.

**Request Body:**
```json
{
  "status": "MAINTENANCE"
}
```

**Status Values:** `READY`, `OCCUPIED`, `MAINTENANCE`

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "MAINTENANCE"
  },
  "message": "Room status updated"
}
```

---

#### Time Slots

Base Path: `/api/v1/admin/slots`

**Authentication:** Bearer token
**Authorization:** ADMIN

##### POST /admin/slots/generate

Generate time slots from schedule templates.

**Request Body:**
```json
{
  "doctorId": "550e8400-e29b-41d4-a716-446655440000",
  "startDate": "2026-04-20",
  "endDate": "2026-04-26",
  "slotDurationMinutes": 30
}
```

**Response (200 OK):**
```json
{
  "data": {
    "slotsGenerated": 42,
    "slotsSkipped": 2,
    "dateRange": "2026-04-20 to 2026-04-26",
    "doctorId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Slot generation complete"
}
```

---

##### PUT /admin/slots/{slotId}/block

Block a time slot.

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "status": "BLOCKED"
  },
  "message": "Slot blocked"
}
```

---

##### DELETE /admin/slots/{slotId}

Delete a time slot.

**Response (200 OK):**
```json
{
  "data": null,
  "message": "Slot deleted"
}
```

---

#### Schedule Templates

Base Path: `/api/v1/admin/schedule-templates`

**Authentication:** Bearer token
**Authorization:** ADMIN

##### GET /admin/schedule-templates

List schedule templates.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "doctoId": "550e8400-e29b-41d4-a716-446655440000",
      "doctorName": "Dr. John Doe",
      "mondaySchedule": "08:00-17:00",
      "tuesdaySchedule": "08:00-17:00",
      "wednesdaySchedule": "08:00-12:00",
      "thursdaySchedule": "08:00-17:00",
      "fridaySchedule": "08:00-17:00",
      "saturdaySchedule": "09:00-13:00",
      "sundaySchedule": "OFF"
    }
  ],
  "message": "Templates retrieved successfully"
}
```

---

#### Special Closures

Base Path: `/api/v1/admin/special-closures`

**Authentication:** Bearer token
**Authorization:** ADMIN

##### GET /admin/special-closures

List special closure dates.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440030",
      "date": "2026-05-01",
      "reason": "Labor Day",
      "type": "HOSPITAL_CLOSURE"
    }
  ],
  "message": "Closures retrieved successfully"
}
```

---

##### POST /admin/special-closures

Create special closure.

**Request Body:**
```json
{
  "date": "2026-09-02",
  "reason": "National Holiday",
  "type": "HOSPITAL_CLOSURE"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440031",
    "date": "2026-09-02",
    "reason": "National Holiday"
  },
  "message": "Closure created"
}
```

---

### Admin - Monitoring

#### System Monitoring

Base Path: `/api/v1/admin/monitoring`

**Authentication:** Bearer token
**Authorization:** ADMIN

##### GET /admin/monitoring

Get system monitoring snapshot.

**Response (200 OK):**
```json
{
  "data": {
    "timestamp": "2026-04-16T11:30:00Z",
    "systemStatus": "HEALTHY",
    "activeUsers": 45,
    "appointmentsToday": 23,
    "completedAppointmentsToday": 8,
    "pendingInvoices": 12,
    "totalHospitalRevenue": "45,000,000 VND",
    "databaseStatus": "CONNECTED",
    "uptime": "99.8%"
  },
  "message": "Monitoring snapshot retrieved"
}
```

---

#### Internal Assistant Monitoring

Base Path: `/api/v1/admin/monitoring/internal-assistant`

**Authentication:** Bearer token
**Authorization:** ADMIN

##### GET /admin/monitoring/internal-assistant

Get internal assistant metrics.

**Response (200 OK):**
```json
{
  "data": {
    "timestamp": "2026-04-16T11:35:00Z",
    "totalSessions": 1250,
    "activeSessions": 45,
    "totalMessages": 8900,
    "averageResponseTime": "2.3 seconds",
    "userSatisfaction": 0.94,
    "feedbackAccuracy": 0.91,
    "topQueries": [
      "Differential diagnosis",
      "Drug interactions",
      "Clinical guidelines"
    ]
  },
  "message": "Internal assistant metrics retrieved"
}
```

---

#### Knowledge Base Management

Base Path: `/api/v1/admin/knowledge-documents`

**Authentication:** Bearer token
**Authorization:** ADMIN

##### GET /admin/knowledge-documents

List knowledge documents.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440040",
      "title": "Cardiology Clinical Guidelines 2026",
      "category": "Cardiology",
      "version": "2.1",
      "uploadedAt": "2026-03-15",
      "status": "ACTIVE",
      "ingestionStatus": "COMPLETE"
    }
  ],
  "message": "Documents retrieved successfully"
}
```

---

##### POST /admin/knowledge-documents

Upload knowledge document.

**Request Body (Multipart Form)**
```
file: [file content - .md, .markdown, or .txt]
title: "Cardiology Clinical Guidelines 2026"
category: "Cardiology"
summary: "Updated guidelines for cardiology practice"
version: "2.1"
owner: "Dr. John Doe"
effectiveDate: "2026-04-16"
tags: "cardiology,guidelines,2026"
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440041",
    "title": "Cardiology Clinical Guidelines 2026",
    "category": "Cardiology",
    "status": "PROCESSING",
    "uploadedAt": "2026-04-16T11:40:00Z"
  },
  "message": "Document uploaded successfully"
}
```

---

##### POST /admin/knowledge-documents/{documentId}/activate

Activate document for use in internal assistant.

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440041",
    "status": "ACTIVE",
    "activatedAt": "2026-04-16T11:45:00Z"
  },
  "message": "Document activated"
}
```

---

## Best Practices

### 1. Authentication Tokens
- Store access tokens in memory only (never in localStorage due to XSS risk)
- Store refresh tokens in HttpOnly secure cookies
- Implement token refresh before expiration (at 90% of expiration time)
- Clear tokens on logout and when invalid

### 2. Error Handling
- Always check HTTP status code before parsing response
- Implement exponential backoff for 5xx errors
- Log error responses for debugging
- Display user-friendly error messages from the `message` field

### 3. Pagination
- Use `page` and `size` parameters for list endpoints
- Check `meta.totalPages` to determine if more results exist
- Avoid requesting more than 100 items per page

### 4. Rate Limiting
- Monitor `X-RateLimit-Remaining` header
- Implement backoff when approaching limits
- Respect `Retry-After` header in 429 responses

### 5. Security
- Always use HTTPS in production
- Validate all user input on the client and server
- Never expose sensitive data in error messages
- Implement CORS properly for cross-origin requests

---

## Support & Contact

For API support and integration questions:
- **Email:** api-support@hospital.com
- **Documentation:** https://api-docs.hospital.com
- **Status Page:** https://status.hospital.com

---

**Version History:**
- v1.0.0 (2026-04-16): Initial release with 35 controllers and 100+ endpoints
