# Hospital Management System – API Endpoints Documentation

**Last Updated:** April 25, 2026
**API Version:** v1
**Base URL:** `/api/v1`
**Authentication:** JWT Bearer Token (stored in HttpOnly cookie for patient-auth, or Authorization header)

---

## Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Patient Management APIs](#patient-management-apis)
3. [Clinical Management APIs](#clinical-management-apis)
4. [Clinical Data APIs](#clinical-data-apis)
5. [Inventory Management APIs](#inventory-management-apis)
6. [Financial Management APIs](#financial-management-apis)
7. [AI & Smart Services APIs](#ai--smart-services-apis)
8. [Internal Assistant APIs](#internal-assistant-apis)
9. [Public Content APIs](#public-content-apis)
10. [Queue Management APIs](#queue-management-apis)
11. [Administrative APIs](#administrative-apis)

---

## Authentication APIs

### Staff Authentication Controller

**Base Path:** `/api/v1/auth`
**Description:** Authentication endpoints for hospital staff (Doctors, Nurses, Accountants, Admins)

#### POST `/login`
**Summary:** Staff member login with credentials (email/phone + password)

**Request Body:**
```json
{
  "emailOrPhone": "string",
  "password": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Authenticated successfully",
  "data": {
    "userId": "uuid",
    "fullName": "string",
    "role": "DOCTOR|NURSE|ACCOUNTANT|ADMIN",
    "tokens": {
      "accessToken": "string (JWT)",
      "expiresInSeconds": 900
    }
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Login successful
- `401 Unauthorized` – Invalid credentials
- `422 Unprocessable Entity` – Email/phone not found or password incorrect

**Headers:**
- Sets `HttpOnly` cookie: `refresh_token={token}` (Path: `/api/v1/auth`)

**Authentication:** None (public endpoint)

---

#### POST `/refresh`
**Summary:** Refresh access token using refresh token from cookie or request body

**Request Body (Optional):**
```json
{
  "refreshToken": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Access token refreshed",
  "data": {
    "accessToken": "string (JWT)",
    "expiresInSeconds": 900
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Token refreshed successfully
- `401 Unauthorized` – Refresh token invalid, expired, or missing

**Headers:**
- Sets new `HttpOnly` cookie: `refresh_token={new_token}` (Path: `/api/v1/auth`)

**Authentication:** Token from cookie or request body

---

#### POST `/logout`
**Summary:** Logout and invalidate refresh token

**Request Body:** None

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Logged out",
  "data": "Logged out"
}
```

**HTTP Status Codes:**
- `200 OK` – Logout successful

**Headers:**
- Clears `HttpOnly` cookie: `refresh_token=""` (maxAge: 0)

**Authentication:** JWT Bearer Token (optional)

---

### Patient Authentication Controller

**Base Path:** `/api/v1/patient-auth`
**Description:** Authentication endpoints for patient portal access

#### POST `/login`
**Summary:** Patient login with credentials (email/phone + password)

**Request Body:**
```json
{
  "emailOrPhone": "string",
  "password": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Authenticated successfully",
  "data": {
    "userId": "uuid",
    "fullName": "string",
    "role": "PATIENT",
    "tokens": {
      "accessToken": "string (JWT)",
      "expiresInSeconds": 900
    }
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Login successful
- `401 Unauthorized` – Invalid credentials
- `422 Unprocessable Entity` – Email/phone not found or password incorrect

**Headers:**
- Sets `HttpOnly` cookie: `patient_refresh_token={token}` (Path: `/api/v1/patient-auth`)

**Authentication:** None (public endpoint)

---

#### POST `/claim`
**Summary:** Activate patient portal access using claim token (for self-registration)

**Request Body:**
```json
{
  "claimToken": "string",
  "password": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Patient portal access activated",
  "data": {
    "userId": "uuid",
    "fullName": "string",
    "role": "PATIENT",
    "tokens": {
      "accessToken": "string (JWT)",
      "expiresInSeconds": 900
    }
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Portal activated successfully
- `401 Unauthorized` – Invalid or expired claim token
- `422 Unprocessable Entity` – Claim token not found or already used

**Authentication:** None (public endpoint)

---

#### POST `/refresh`
**Summary:** Refresh patient access token using refresh token from cookie or request body

**Request Body (Optional):**
```json
{
  "refreshToken": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Access token refreshed",
  "data": {
    "accessToken": "string (JWT)",
    "expiresInSeconds": 900
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Token refreshed successfully
- `401 Unauthorized` – Refresh token invalid, expired, or missing

**Authentication:** Token from cookie or request body

---

#### POST `/logout`
**Summary:** Patient logout and invalidate refresh token

**Request Body:** None

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Logged out",
  "data": "Logged out"
}
```

**HTTP Status Codes:**
- `200 OK` – Logout successful

**Headers:**
- Clears `HttpOnly` cookie: `patient_refresh_token=""` (maxAge: 0)

**Authentication:** JWT Bearer Token (optional)

---

## Patient Management APIs

### Patient Controller

**Base Path:** `/api/v1/patients`
**Description:** Public patient information endpoints (doctor-accessible)

#### GET `/{cccd}/history`
**Summary:** Get patient medical history by CCCD (Vietnamese ID)

**Path Parameters:**
- `cccd` (string): Vietnamese national ID number

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "patientId": "uuid",
    "fullName": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "MALE|FEMALE",
    "cccd": "string",
    "bloodType": "O+|O-|A+|A-|B+|B-|AB+|AB-",
    "appointments": [
      {
        "appointmentId": "uuid",
        "appointmentDate": "YYYY-MM-DD",
        "doctor": "string",
        "department": "string",
        "diagnosis": "string",
        "prescription": "string"
      }
    ],
    "allergies": ["string"],
    "previousDiagnoses": ["string"]
  }
}
```

**HTTP Status Codes:**
- `200 OK` – History retrieved
- `404 Not Found` – Patient not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`

---

### Patient Record Controller

**Base Path:** `/api/v1/patient-records`
**Description:** Patient record search and detail retrieval (doctor-accessible)

#### GET `/`
**Summary:** Search patient records by query (name, email, CCCD, phone)

**Query Parameters:**
- `query` (string, optional): Search term (name, email, CCCD, or phone)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "patientId": "uuid",
      "fullName": "string",
      "email": "string",
      "phoneNumber": "string",
      "cccd": "string",
      "lastVisitDate": "YYYY-MM-DD",
      "totalAppointments": 5
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Records retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR` or `ROLE_ADMIN`

---

#### GET `/{patientId}`
**Summary:** Get detailed patient record by patient ID

**Path Parameters:**
- `patientId` (uuid): Patient ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "patientId": "uuid",
    "fullName": "string",
    "email": "string",
    "phoneNumber": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "MALE|FEMALE",
    "cccd": "string",
    "address": "string",
    "bloodType": "O+|O-|A+|A-|B+|B-|AB+|AB-",
    "allergies": ["string"],
    "previousDiagnoses": ["string"],
    "emergencyContactName": "string",
    "emergencyContactPhone": "string",
    "appointments": [
      {
        "appointmentId": "uuid",
        "appointmentDate": "YYYY-MM-DD",
        "doctor": "string",
        "status": "CONFIRMED|COMPLETED|CANCELLED"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Record retrieved
- `404 Not Found` – Patient not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR` or `ROLE_ADMIN`

---

### Patient Portal Controller

**Base Path:** `/api/v1/patient-portal`
**Description:** Patient-facing portal endpoints (patient role only)

#### GET `/overview`
**Summary:** Get patient's portal overview dashboard

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "patientId": "uuid",
    "fullName": "string",
    "upcomingAppointments": 3,
    "pendingLabResults": 1,
    "unreadMessages": 2,
    "nextAppointmentDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Overview retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_PATIENT`

---

#### GET `/appointments`
**Summary:** Get patient's appointment list

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "appointmentId": "uuid",
      "appointmentDate": "YYYY-MM-DD",
      "appointmentTime": "HH:MM",
      "doctor": "string",
      "department": "string",
      "status": "CONFIRMED|COMPLETED|CANCELLED"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Appointments retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_PATIENT`

---

#### GET `/lab-results`
**Summary:** Get patient's lab results

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "resultId": "uuid",
      "testName": "string",
      "resultDate": "YYYY-MM-DD",
      "status": "PENDING|READY",
      "doctor": "string"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Lab results retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_PATIENT`

---

#### GET `/messages`
**Summary:** Get patient's message threads

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "threadId": "uuid",
      "doctorName": "string",
      "lastMessage": "string",
      "lastMessageDate": "YYYY-MM-DD HH:MM",
      "unreadCount": 2
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Messages retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_PATIENT`

---

#### GET `/profile`
**Summary:** Get patient's profile information

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "patientId": "uuid",
    "fullName": "string",
    "email": "string",
    "phoneNumber": "string",
    "dateOfBirth": "YYYY-MM-DD",
    "gender": "MALE|FEMALE",
    "address": "string",
    "emergencyContactName": "string",
    "emergencyContactPhone": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Profile retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_PATIENT`

---

#### PUT `/profile`
**Summary:** Update patient's profile information

**Request Body:**
```json
{
  "fullName": "string",
  "phoneNumber": "string",
  "address": "string",
  "emergencyContactName": "string",
  "emergencyContactPhone": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "patientId": "uuid",
    "fullName": "string",
    "email": "string",
    "phoneNumber": "string",
    "address": "string",
    "emergencyContactName": "string",
    "emergencyContactPhone": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Profile updated
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_PATIENT`

---

## Clinical Management APIs

### Doctor Controller

**Base Path:** `/api/v1/doctors`
**Description:** Public doctor information and availability endpoints

#### GET `/`
**Summary:** List all active doctors

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "doctorId": "uuid",
      "fullName": "string",
      "email": "string",
      "specialization": "string",
      "department": "string",
      "yearsOfExperience": 10,
      "biography": "string",
      "photoUrl": "string|null"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Doctors retrieved

**Authorization:** None (public endpoint)

---

#### GET `/{doctorId}`
**Summary:** Get specific doctor details

**Path Parameters:**
- `doctorId` (uuid): Doctor ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "doctorId": "uuid",
    "fullName": "string",
    "email": "string",
    "specialization": "string",
    "department": "string",
    "yearsOfExperience": 10,
    "biography": "string",
    "photoUrl": "string|null",
    "qualifications": ["string"]
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Doctor retrieved
- `404 Not Found` – Doctor not found

**Authorization:** None (public endpoint)

---

#### GET `/{doctorId}/slots`
**Summary:** List available time slots for a doctor on a specific date

**Path Parameters:**
- `doctorId` (uuid): Doctor ID

**Query Parameters:**
- `date` (YYYY-MM-DD, required): Target date for slots

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "slotId": "uuid",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "status": "AVAILABLE|BOOKED|BLOCKED",
      "roomNumber": "string"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Slots retrieved
- `404 Not Found` – Doctor not found
- `400 Bad Request` – Invalid date format

**Authorization:** None (public endpoint)

---

### Department Controller

**Base Path:** `/api/v1/departments`
**Description:** Public department information endpoints

#### GET `/`
**Summary:** List all active departments

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "departmentId": "uuid",
      "name": "string",
      "description": "string",
      "numberOfDoctors": 5,
      "isActive": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Departments retrieved

**Authorization:** None (public endpoint)

---

#### GET `/{departmentId}`
**Summary:** Get department detail with doctor list

**Path Parameters:**
- `departmentId` (uuid): Department ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "departmentId": "uuid",
    "name": "string",
    "description": "string",
    "doctors": [
      {
        "doctorId": "uuid",
        "fullName": "string",
        "email": "string",
        "specialization": "string"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Department retrieved
- `404 Not Found` – Department not found

**Authorization:** None (public endpoint)

---

#### GET `/{departmentId}/doctors`
**Summary:** Get list of doctors in a specific department

**Path Parameters:**
- `departmentId` (uuid): Department ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "doctorId": "uuid",
      "fullName": "string",
      "email": "string",
      "specialization": "string"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Doctors retrieved
- `404 Not Found` – Department not found

**Authorization:** None (public endpoint)

---

### Appointment Controller

**Base Path:** `/api/v1/appointments`
**Description:** Appointment creation and management endpoints

#### POST `/`
**Summary:** Create a new appointment booking

**Request Body:**
```json
{
  "patientCccId": "string",
  "patientEmail": "string",
  "patientPhoneNumber": "string",
  "patientFullName": "string",
  "doctorId": "uuid",
  "appointmentDate": "YYYY-MM-DD",
  "slotId": "uuid",
  "reason": "string"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "message": "",
  "data": {
    "appointmentId": "uuid",
    "patientId": "uuid",
    "doctorId": "uuid",
    "appointmentDate": "YYYY-MM-DD",
    "appointmentTime": "HH:MM",
    "status": "CONFIRMED",
    "reason": "string"
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Appointment created
- `400 Bad Request` – Invalid request data
- `409 Conflict` – Slot already booked
- `422 Unprocessable Entity` – Patient or doctor not found

**Authorization:** None (public endpoint)

---

#### GET `/`
**Summary:** List appointments with filtering and pagination

**Query Parameters:**
- `status` (CONFIRMED|COMPLETED|CANCELLED, optional): Filter by status
- `doctorId` (uuid, optional): Filter by doctor
- `date` (YYYY-MM-DD, optional): Filter by date
- `page` (integer, default: 0): Page number
- `size` (integer, default: 20): Page size

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "pagination": {
    "totalElements": 100,
    "page": 0,
    "size": 20,
    "totalPages": 5
  },
  "data": [
    {
      "appointmentId": "uuid",
      "patientName": "string",
      "doctorName": "string",
      "appointmentDate": "YYYY-MM-DD",
      "appointmentTime": "HH:MM",
      "status": "CONFIRMED|COMPLETED|CANCELLED"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Appointments retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`
**Note:** Doctors see only their own appointments by default

---

#### GET `/today`
**Summary:** Get appointments for today (nurse view)

**Query Parameters:**
- `date` (YYYY-MM-DD, optional): Defaults to today if not provided

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "appointmentId": "uuid",
      "patientName": "string",
      "doctorName": "string",
      "appointmentTime": "HH:MM",
      "status": "CONFIRMED|COMPLETED|CANCELLED",
      "roomNumber": "string"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Appointments retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_NURSE`

---

#### GET `/{appointmentId}`
**Summary:** Get appointment detail

**Path Parameters:**
- `appointmentId` (uuid): Appointment ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "appointmentId": "uuid",
    "patientId": "uuid",
    "patientName": "string",
    "doctorId": "uuid",
    "doctorName": "string",
    "appointmentDate": "YYYY-MM-DD",
    "appointmentTime": "HH:MM",
    "status": "CONFIRMED|COMPLETED|CANCELLED",
    "reason": "string",
    "roomNumber": "string",
    "departmentName": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Appointment retrieved
- `404 Not Found` – Appointment not found
- `401 Unauthorized` – Unauthorized access

**Authorization:** `ROLE_DOCTOR` (only own appointments)

---

#### DELETE `/{appointmentId}`
**Summary:** Cancel an appointment

**Path Parameters:**
- `appointmentId` (uuid): Appointment ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Appointment cancelled",
  "data": null
}
```

**HTTP Status Codes:**
- `200 OK` – Appointment cancelled
- `404 Not Found` – Appointment not found
- `409 Conflict` – Cannot cancel already-completed appointment
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN` or `ROLE_NURSE`

---

### Schedule Controller

**Base Path:** `/api/v1/me`
**Description:** Doctor's personal schedule endpoints

#### GET `/schedule`
**Summary:** Get doctor's schedule for a date or week

**Query Parameters (exactly one required):**
- `date` (YYYY-MM-DD or "today"): Specific date or "today"
- `week` (YYYY-Www): ISO week format (e.g., "2026-W10")

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "appointmentId": "uuid",
      "patientName": "string",
      "appointmentTime": "HH:MM",
      "duration": 30,
      "roomNumber": "string",
      "status": "CONFIRMED|COMPLETED|CANCELLED"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Schedule retrieved
- `400 Bad Request` – Missing or invalid date/week parameter
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`

---

### Medical Record Controller

**Base Path:** `/api/v1/medical-records`
**Description:** Medical record creation and prescription generation

#### POST `/`
**Summary:** Create a medical record with diagnosis and prescription

**Request Body:**
```json
{
  "appointmentId": "uuid",
  "diagnosis": "string",
  "prescriptions": [
    {
      "medicineId": "uuid",
      "dosage": "string",
      "duration": "string",
      "instructions": "string"
    }
  ],
  "notes": "string"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "recordId": "uuid",
    "appointmentId": "uuid",
    "diagnosis": "string",
    "prescriptions": [
      {
        "prescriptionId": "uuid",
        "medicineName": "string",
        "dosage": "string"
      }
    ],
    "createdDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Record created
- `400 Bad Request` – Invalid input
- `404 Not Found` – Appointment not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`

---

#### POST `/preview.pdf`
**Summary:** Preview prescription PDF before saving

**Request Body:**
```json
{
  "appointmentId": "uuid",
  "diagnosis": "string",
  "prescriptions": [
    {
      "medicineId": "uuid",
      "dosage": "string",
      "duration": "string",
      "instructions": "string"
    }
  ]
}
```

**Success Response:** `200 OK` (Binary PDF content)

**HTTP Status Codes:**
- `200 OK` – PDF generated
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Missing authentication

**Content-Type:** `application/pdf`

**Authorization:** `ROLE_DOCTOR`

---

#### GET `/{recordId}/prescription.pdf`
**Summary:** Download saved prescription PDF

**Path Parameters:**
- `recordId` (uuid): Medical record ID

**Success Response:** `200 OK` (Binary PDF content)

**HTTP Status Codes:**
- `200 OK` – PDF downloaded
- `404 Not Found` – Record not found
- `401 Unauthorized` – Missing authentication

**Content-Type:** `application/pdf`
**Content-Disposition:** `attachment; filename="prescription_{recordId}.pdf"`

**Authorization:** `ROLE_DOCTOR`

---

## Clinical Data APIs

### Vital Signs Controller

**Base Path:** `/api/v1/vital-signs`
**Description:** Patient vital signs recording and management

#### POST `/`
**Summary:** Record patient vital signs

**Request Body:**
```json
{
  "appointmentId": "uuid",
  "temperature": 37.5,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 72,
  "respiratoryRate": 16,
  "oxygenSaturation": 98.5,
  "weight": 70.5
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "vitalSignId": "uuid",
    "appointmentId": "uuid",
    "temperature": 37.5,
    "bloodPressure": "120/80",
    "heartRate": 72,
    "respiratoryRate": 16,
    "oxygenSaturation": 98.5,
    "weight": 70.5,
    "recordedDate": "YYYY-MM-DD HH:MM"
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Vital signs recorded
- `400 Bad Request` – Invalid input
- `404 Not Found` – Appointment not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### GET `/{appointmentId}`
**Summary:** Get vital signs for an appointment

**Path Parameters:**
- `appointmentId` (uuid): Appointment ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "vitalSignId": "uuid",
    "appointmentId": "uuid",
    "temperature": 37.5,
    "bloodPressure": "120/80",
    "heartRate": 72,
    "respiratoryRate": 16,
    "oxygenSaturation": 98.5,
    "weight": 70.5,
    "recordedDate": "YYYY-MM-DD HH:MM"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Vital signs retrieved
- `404 Not Found` – Appointment or vital signs not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### PUT `/{vitalSignId}`
**Summary:** Update recorded vital signs

**Path Parameters:**
- `vitalSignId` (uuid): Vital sign record ID

**Request Body:**
```json
{
  "temperature": 37.5,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 72,
  "respiratoryRate": 16,
  "oxygenSaturation": 98.5,
  "weight": 70.5
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "vitalSignId": "uuid",
    "temperature": 37.5,
    "bloodPressure": "120/80",
    "heartRate": 72
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Vital signs updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Vital sign record not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### DELETE `/{vitalSignId}`
**Summary:** Delete vital sign record

**Path Parameters:**
- `vitalSignId` (uuid): Vital sign record ID

**Success Response:** `204 No Content`

**HTTP Status Codes:**
- `204 No Content` – Record deleted
- `404 Not Found` – Record not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

### Lab Result Controller

**Base Path:** `/api/v1`
**Description:** Lab test results management

#### POST `/lab-results`
**Summary:** Create lab test result

**Request Body:**
```json
{
  "appointmentId": "uuid",
  "testName": "string",
  "resultValue": "string",
  "resultUnit": "string",
  "normalRange": "string",
  "status": "NORMAL|ABNORMAL"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "resultId": "uuid",
    "appointmentId": "uuid",
    "testName": "string",
    "resultValue": "string",
    "resultUnit": "string",
    "normalRange": "string",
    "status": "NORMAL|ABNORMAL",
    "resultDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Lab result recorded
- `400 Bad Request` – Invalid input
- `404 Not Found` – Appointment not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### GET `/lab-results/{resultId}`
**Summary:** Get specific lab result

**Path Parameters:**
- `resultId` (uuid): Lab result ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "resultId": "uuid",
    "appointmentId": "uuid",
    "testName": "string",
    "resultValue": "string",
    "resultUnit": "string",
    "normalRange": "string",
    "status": "NORMAL|ABNORMAL",
    "resultDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Lab result retrieved
- `404 Not Found` – Lab result not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### GET `/appointments/{appointmentId}/lab-results`
**Summary:** Get all lab results for an appointment

**Path Parameters:**
- `appointmentId` (uuid): Appointment ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "resultId": "uuid",
      "testName": "string",
      "resultValue": "string",
      "status": "NORMAL|ABNORMAL",
      "resultDate": "YYYY-MM-DD"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Lab results retrieved
- `404 Not Found` – Appointment not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### DELETE `/lab-results/{resultId}`
**Summary:** Delete a lab result

**Path Parameters:**
- `resultId` (uuid): Lab result ID

**Success Response:** `204 No Content`

**HTTP Status Codes:**
- `204 No Content` – Result deleted
- `404 Not Found` – Result not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

## Inventory Management APIs

### Inventory Controller

**Base Path:** `/api/v1/inventory`
**Description:** Hospital inventory (medicines, supplies) management

#### GET `/items`
**Summary:** List all inventory items

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "itemId": "uuid",
      "name": "string",
      "description": "string",
      "category": "string",
      "unit": "string",
      "quantity": 100,
      "reorderLevel": 20,
      "unitPrice": 15.50
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Items retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### POST `/items`
**Summary:** Create a new inventory item

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "category": "string",
  "unit": "string",
  "unitPrice": 15.50,
  "reorderLevel": 20
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "itemId": "uuid",
    "name": "string",
    "description": "string",
    "category": "string",
    "unit": "string",
    "unitPrice": 15.50,
    "reorderLevel": 20,
    "quantity": 0
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Item created
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### PUT `/items/{itemId}`
**Summary:** Update inventory item details

**Path Parameters:**
- `itemId` (uuid): Item ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "unitPrice": 15.50,
  "reorderLevel": 25
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "itemId": "uuid",
    "name": "string",
    "unitPrice": 15.50,
    "reorderLevel": 25
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Item updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Item not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### DELETE `/items/{itemId}`
**Summary:** Delete inventory item

**Path Parameters:**
- `itemId` (uuid): Item ID

**Success Response:** `204 No Content`

**HTTP Status Codes:**
- `204 No Content` – Item deleted
- `404 Not Found` – Item not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### GET `/lots`
**Summary:** List all inventory lots (batch tracking)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "lotId": "uuid",
      "itemId": "uuid",
      "itemName": "string",
      "lotNumber": "string",
      "quantity": 50,
      "expiryDate": "YYYY-MM-DD",
      "manufacturerDate": "YYYY-MM-DD",
      "unitCost": 10.00
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Lots retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### POST `/lots`
**Summary:** Create a new inventory lot

**Request Body:**
```json
{
  "itemId": "uuid",
  "lotNumber": "string",
  "quantity": 50,
  "expiryDate": "YYYY-MM-DD",
  "manufacturerDate": "YYYY-MM-DD",
  "unitCost": 10.00
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "lotId": "uuid",
    "itemId": "uuid",
    "lotNumber": "string",
    "quantity": 50,
    "expiryDate": "YYYY-MM-DD",
    "unitCost": 10.00
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Lot created
- `400 Bad Request` – Invalid input
- `404 Not Found` – Item not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### PUT `/lots/{lotId}`
**Summary:** Update inventory lot details

**Path Parameters:**
- `lotId` (uuid): Lot ID

**Request Body:**
```json
{
  "quantity": 48,
  "expiryDate": "YYYY-MM-DD",
  "unitCost": 10.50
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "lotId": "uuid",
    "quantity": 48,
    "expiryDate": "YYYY-MM-DD",
    "unitCost": 10.50
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Lot updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Lot not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### GET `/movements`
**Summary:** List inventory movements (stock adjustments)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "movementId": "uuid",
      "itemId": "uuid",
      "itemName": "string",
      "movementType": "IN|OUT",
      "quantity": 10,
      "reason": "PURCHASE|USAGE|LOSS|ADJUSTMENT",
      "movementDate": "YYYY-MM-DD HH:MM",
      "recordedBy": "string"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Movements retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### POST `/movements`
**Summary:** Record inventory movement (usage, purchase, loss)

**Request Body:**
```json
{
  "itemId": "uuid",
  "lotId": "uuid",
  "movementType": "IN|OUT",
  "quantity": 10,
  "reason": "PURCHASE|USAGE|LOSS|ADJUSTMENT"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "data": {
    "movementId": "uuid",
    "itemId": "uuid",
    "movementType": "IN|OUT",
    "quantity": 10,
    "reason": "PURCHASE|USAGE|LOSS|ADJUSTMENT",
    "movementDate": "YYYY-MM-DD HH:MM"
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Movement recorded
- `400 Bad Request` – Invalid input
- `404 Not Found` – Item or lot not found
- `409 Conflict` – Insufficient stock for OUT movement
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

## Financial Management APIs

### Invoice Controller

**Base Path:** `/api/v1/invoices`
**Description:** Invoice and billing management

#### GET `/`
**Summary:** List all invoices with optional status filter

**Query Parameters:**
- `status` (DRAFT|ISSUED|PAID|VOIDED, optional): Filter by status

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "invoiceId": "uuid",
      "appointmentId": "uuid",
      "patientName": "string",
      "totalAmount": 500.00,
      "invoiceStatus": "DRAFT|ISSUED|PAID|VOIDED",
      "issueDate": "YYYY-MM-DD",
      "paymentMethod": "CASH|CARD|BANK_TRANSFER"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Invoices retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create invoice for an appointment

**Request Body:**
```json
{
  "appointmentId": "uuid"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Invoice created",
  "data": {
    "invoiceId": "uuid",
    "appointmentId": "uuid",
    "patientName": "string",
    "totalAmount": 500.00,
    "invoiceStatus": "DRAFT",
    "issueDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Invoice created
- `400 Bad Request` – Invalid input
- `404 Not Found` – Appointment not found
- `409 Conflict` – Invoice already exists for appointment
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### POST `/{invoiceId}/payments`
**Summary:** Record payment for an invoice

**Path Parameters:**
- `invoiceId` (uuid): Invoice ID

**Request Body:**
```json
{
  "paymentMethod": "CASH|CARD|BANK_TRANSFER"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Payment captured",
  "data": {
    "invoiceId": "uuid",
    "invoiceStatus": "PAID",
    "paymentMethod": "CASH|CARD|BANK_TRANSFER",
    "paymentDate": "YYYY-MM-DD HH:MM"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Payment recorded
- `404 Not Found` – Invoice not found
- `409 Conflict` – Invoice already paid or voided
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### POST `/{invoiceId}/void`
**Summary:** Void (cancel) an invoice

**Path Parameters:**
- `invoiceId` (uuid): Invoice ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Invoice voided",
  "data": {
    "invoiceId": "uuid",
    "invoiceStatus": "VOIDED"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Invoice voided
- `404 Not Found` – Invoice not found
- `409 Conflict` – Cannot void paid invoice
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

### Pricing Controller

**Base Path:** `/api/v1/pricing`
**Description:** Service pricing management

#### GET `/`
**Summary:** List all service pricing rules

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "pricingId": "uuid",
      "serviceName": "string",
      "basePrice": 500.00,
      "description": "string",
      "isActive": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Pricing retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create new service pricing rule

**Request Body:**
```json
{
  "serviceName": "string",
  "basePrice": 500.00,
  "description": "string"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Pricing rule created",
  "data": {
    "pricingId": "uuid",
    "serviceName": "string",
    "basePrice": 500.00,
    "description": "string",
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Pricing created
- `400 Bad Request` – Invalid input
- `409 Conflict` – Service pricing already exists
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### PUT `/{pricingId}`
**Summary:** Update service pricing

**Path Parameters:**
- `pricingId` (uuid): Pricing ID

**Request Body:**
```json
{
  "serviceName": "string",
  "basePrice": 550.00,
  "description": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Pricing rule updated",
  "data": {
    "pricingId": "uuid",
    "basePrice": 550.00
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Pricing updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Pricing not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

### Revenue Report Controller

**Base Path:** `/api/v1/reports/revenue`
**Description:** Financial reporting endpoints

#### GET `/daily`
**Summary:** Get daily revenue report

**Query Parameters:**
- `date` (YYYY-MM-DD, required): Report date

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "reportDate": "YYYY-MM-DD",
    "totalRevenue": 5000.00,
    "appointmentsCount": 10,
    "paymentsReceived": 4800.00,
    "outstandingAmount": 200.00,
    "paymentBreakdown": {
      "CASH": 2000.00,
      "CARD": 2500.00,
      "BANK_TRANSFER": 300.00
    }
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Report retrieved
- `400 Bad Request` – Invalid date format
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

#### GET `/monthly`
**Summary:** Get monthly revenue report

**Query Parameters:**
- `month` (YYYY-MM, required): Report month (format: 2026-04)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "reportMonth": "2026-04",
    "totalRevenue": 150000.00,
    "appointmentsCount": 300,
    "paymentsReceived": 145000.00,
    "outstandingAmount": 5000.00,
    "paymentBreakdown": {
      "CASH": 60000.00,
      "CARD": 75000.00,
      "BANK_TRANSFER": 10000.00
    },
    "dailyAverageRevenue": 5000.00
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Report retrieved
- `400 Bad Request` – Invalid month format
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

## AI & Smart Services APIs

### Chatbot Controller

**Base Path:** `/api/v1/chatbot`
**Description:** Public healthcare information chatbot

#### POST `/messages`
**Summary:** Send message to health chatbot

**Request Body:**
```json
{
  "message": "What are the symptoms of flu?"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "messageId": "uuid",
    "userMessage": "What are the symptoms of flu?",
    "botResponse": "string",
    "confidence": 0.95
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Response generated
- `400 Bad Request` – Empty message
- `500 Internal Server Error` – Chatbot service error

**Authorization:** None (public endpoint)

---

### AI Analysis Controller

**Base Path:** `/api/v1/ai`
**Description:** AI-powered medical analysis

#### POST `/analyze-symptoms`
**Summary:** AI symptom analysis for patient screening

**Request Body:**
```json
{
  "symptoms": [
    "fever",
    "cough",
    "fatigue"
  ],
  "duration": "3 days",
  "severity": "HIGH|MEDIUM|LOW"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "analysisId": "uuid",
    "userSymptoms": ["fever", "cough", "fatigue"],
    "possibleConditions": [
      {
        "condition": "Influenza",
        "probability": 0.75,
        "recommendedSpecialty": "General Medicine"
      }
    ],
    "recommendationMessage": "string",
    "shouldSeekImmediateAttention": false
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Analysis completed
- `400 Bad Request` – Invalid input
- `500 Internal Server Error` – Analysis service error

**Authorization:** None (public endpoint)

---

## Internal Assistant APIs

### Internal Assistant Controller

**Base Path:** `/api/v1/internal-assistant`
**Description:** AI clinical support for doctors and nurses

#### GET `/sessions/current`
**Summary:** Get or create internal assistant session

**Query Parameters:**
- `mode` (PATIENT_ANALYSIS|DIAGNOSIS_SUPPORT|TREATMENT_PLANNING|LITERATURE_REVIEW, required): Session mode
- `patientId` (uuid, optional): Patient ID for context
- `appointmentId` (uuid, optional): Appointment ID for context
- `sessionId` (uuid, optional): Resume existing session

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sessionId": "uuid",
    "mode": "PATIENT_ANALYSIS|DIAGNOSIS_SUPPORT|TREATMENT_PLANNING|LITERATURE_REVIEW",
    "patientId": "uuid|null",
    "appointmentId": "uuid|null",
    "createdTime": "YYYY-MM-DD HH:MM",
    "messages": [
      {
        "messageId": "uuid",
        "senderRole": "DOCTOR|ASSISTANT",
        "content": "string",
        "timestamp": "YYYY-MM-DD HH:MM"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Session retrieved/created
- `400 Bad Request` – Invalid mode
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### POST `/messages`
**Summary:** Send message to internal assistant

**Request Body:**
```json
{
  "sessionId": "uuid",
  "message": "string",
  "attachments": [
    {
      "type": "LAB_RESULT|IMAGING|VITAL_SIGNS",
      "data": "string|object"
    }
  ]
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "messageId": "uuid",
    "userMessage": "string",
    "assistantResponse": "string",
    "citations": [
      {
        "source": "string",
        "relevance": 0.92
      }
    ],
    "confidence": 0.88,
    "recommendations": [
      {
        "type": "DIAGNOSTIC_TEST|MEDICATION|SPECIALIST_REFERRAL",
        "description": "string"
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Response generated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Session not found
- `401 Unauthorized` – Missing authentication
- `500 Internal Server Error` – AI service error

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

#### POST `/messages/{messageId}/feedback`
**Summary:** Submit feedback on assistant response

**Path Parameters:**
- `messageId` (uuid): Message ID

**Request Body:**
```json
{
  "rating": 1|2|3|4|5,
  "feedback": "string",
  "helpful": true|false,
  "accurate": true|false
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "feedbackId": "uuid",
    "messageId": "uuid",
    "rating": 5,
    "recorded": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Feedback recorded
- `404 Not Found` – Message not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_DOCTOR`, `ROLE_NURSE`, or `ROLE_ADMIN`

---

## Public Content APIs

### Public Content Controller

**Base Path:** `/api/v1`
**Description:** Public hospital information and news

#### GET `/content/home`
**Summary:** Get hospital home page content

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "hospitalName": "string",
    "hospitalDescription": "string",
    "sections": [
      {
        "sectionId": "uuid",
        "sectionTitle": "string",
        "content": "string",
        "order": 1
      }
    ]
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Content retrieved

**Authorization:** None (public endpoint)

---

#### GET `/news`
**Summary:** Get hospital news and announcements

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "articleId": "uuid",
      "title": "string",
      "summary": "string",
      "content": "string",
      "publishDate": "YYYY-MM-DD",
      "category": "string",
      "imageUrl": "string|null"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – News retrieved

**Authorization:** None (public endpoint)

---

## Queue Management APIs

### Queue Controller

**Base Path:** `/api/v1/queue`
**Description:** Patient queue and waiting list management

#### GET `/today`
**Summary:** Get current day patient queue

**Query Parameters:**
- `date` (YYYY-MM-DD, optional): Specific date (defaults to today)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "appointmentId": "uuid",
      "queuePosition": 1,
      "patientName": "string",
      "doctorName": "string",
      "scheduledTime": "HH:MM",
      "roomNumber": "string",
      "status": "WAITING|IN_PROGRESS|COMPLETED",
      "estimatedWaitTime": 15
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Queue retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_NURSE`

---

## Administrative APIs

### Admin User Controller

**Base Path:** `/api/v1/admin/users`
**Description:** Staff user management (admin only)

#### GET `/`
**Summary:** List all staff users

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "userId": "uuid",
      "fullName": "string",
      "email": "string",
      "phoneNumber": "string",
      "role": "DOCTOR|NURSE|ACCOUNTANT|ADMIN",
      "department": "string|null",
      "isActive": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Users retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### GET `/{userId}`
**Summary:** Get specific staff user details

**Path Parameters:**
- `userId` (uuid): User ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "userId": "uuid",
    "fullName": "string",
    "email": "string",
    "phoneNumber": "string",
    "role": "DOCTOR|NURSE|ACCOUNTANT|ADMIN",
    "department": "string|null",
    "isActive": true,
    "createdDate": "YYYY-MM-DD",
    "lastLoginDate": "YYYY-MM-DD HH:MM"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – User retrieved
- `404 Not Found` – User not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create new staff user

**Request Body:**
```json
{
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string",
  "password": "string",
  "role": "DOCTOR|NURSE|ACCOUNTANT|ADMIN",
  "departmentId": "uuid|null"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "message": "User created",
  "data": {
    "userId": "uuid",
    "fullName": "string",
    "email": "string",
    "role": "DOCTOR|NURSE|ACCOUNTANT|ADMIN",
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `201 Created` – User created
- `400 Bad Request` – Invalid input
- `409 Conflict` – Email already exists
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{userId}`
**Summary:** Update staff user details

**Path Parameters:**
- `userId` (uuid): User ID

**Request Body:**
```json
{
  "fullName": "string",
  "phoneNumber": "string",
  "departmentId": "uuid|null"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User updated",
  "data": {
    "userId": "uuid",
    "fullName": "string",
    "phoneNumber": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – User updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – User not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### DELETE `/{userId}`
**Summary:** Soft-delete (deactivate) a staff user

**Path Parameters:**
- `userId` (uuid): User ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User deactivated",
  "data": null
}
```

**HTTP Status Codes:**
- `200 OK` – User deactivated
- `404 Not Found` – User not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/{userId}/activate`
**Summary:** Reactivate a deactivated staff account

**Path Parameters:**
- `userId` (uuid): User ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User activated",
  "data": {
    "userId": "uuid",
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – User activated
- `404 Not Found` – User not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/{userId}/deactivate`
**Summary:** Deactivate a staff account

**Path Parameters:**
- `userId` (uuid): User ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "User deactivated",
  "data": {
    "userId": "uuid",
    "isActive": false
  }
}
```

**HTTP Status Codes:**
- `200 OK` – User deactivated
- `404 Not Found` – User not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{userId}/role`
**Summary:** Change staff user role

**Path Parameters:**
- `userId` (uuid): User ID

**Request Body:**
```json
{
  "role": "DOCTOR|NURSE|ACCOUNTANT|ADMIN"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Role updated",
  "data": {
    "userId": "uuid",
    "role": "DOCTOR|NURSE|ACCOUNTANT|ADMIN"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Role updated
- `400 Bad Request` – Invalid role
- `404 Not Found` – User not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Department Controller

**Base Path:** `/api/v1/admin/departments`
**Description:** Department management (admin only)

#### GET `/`
**Summary:** List all departments

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "departmentId": "uuid",
      "name": "string",
      "description": "string",
      "numberOfDoctors": 5,
      "isActive": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Departments retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### GET `/{departmentId}`
**Summary:** Get department details

**Path Parameters:**
- `departmentId` (uuid): Department ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "departmentId": "uuid",
    "name": "string",
    "description": "string",
    "doctors": [
      {
        "doctorId": "uuid",
        "fullName": "string",
        "email": "string"
      }
    ],
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Department retrieved
- `404 Not Found` – Department not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create new department

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Success Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Department created",
  "data": {
    "departmentId": "uuid",
    "name": "string",
    "description": "string",
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `201 Created` – Department created
- `400 Bad Request` – Invalid input
- `409 Conflict` – Department name already exists
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{departmentId}`
**Summary:** Update department details

**Path Parameters:**
- `departmentId` (uuid): Department ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Department updated",
  "data": {
    "departmentId": "uuid",
    "name": "string",
    "description": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Department updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Department not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### DELETE `/{departmentId}`
**Summary:** Soft-delete (deactivate) a department

**Path Parameters:**
- `departmentId` (uuid): Department ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Department deactivated",
  "data": null
}
```

**HTTP Status Codes:**
- `200 OK` – Department deactivated
- `404 Not Found` – Department not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/{departmentId}/assign-doctor`
**Summary:** Assign a doctor to a department

**Path Parameters:**
- `departmentId` (uuid): Department ID

**Request Body:**
```json
{
  "doctorId": "uuid"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Doctor assigned",
  "data": {
    "doctorId": "uuid",
    "fullName": "string",
    "email": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Doctor assigned
- `404 Not Found` – Doctor or department not found
- `409 Conflict` – Doctor already in department
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### DELETE `/{departmentId}/remove-doctor/{doctorId}`
**Summary:** Remove a doctor from a department

**Path Parameters:**
- `departmentId` (uuid): Department ID
- `doctorId` (uuid): Doctor ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Doctor removed",
  "data": {
    "doctorId": "uuid",
    "fullName": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Doctor removed
- `404 Not Found` – Doctor or department not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Room Controller

**Base Path:** `/api/v1/admin/rooms`
**Description:** Clinical room management

#### GET `/`
**Summary:** List all rooms

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "roomId": "uuid",
      "room Number": "string",
      "department": "string",
      "capacity": 1,
      "status": "READY|OCCUPIED|MAINTENANCE",
      "isActive": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Rooms retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### GET `/{roomId}`
**Summary:** Get room details

**Path Parameters:**
- `roomId` (uuid): Room ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "roomId": "uuid",
    "roomNumber": "string",
    "department": "string",
    "capacity": 1,
    "status": "READY|OCCUPIED|MAINTENANCE",
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Room retrieved
- `404 Not Found` – Room not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create new room

**Request Body:**
```json
{
  "roomNumber": "string",
  "departmentId": "uuid",
  "capacity": 1
}
```

**Success Response:** `200 OK` (Note: should be 201 Created)
```json
{
  "status": "success",
  "data": {
    "roomId": "uuid",
    "roomNumber": "string",
    "department": "string",
    "capacity": 1,
    "status": "READY",
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Room created
- `400 Bad Request` – Invalid input
- `404 Not Found` – Department not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{roomId}`
**Summary:** Update room details

**Path Parameters:**
- `roomId` (uuid): Room ID

**Request Body:**
```json
{
  "roomNumber": "string",
  "capacity": 1
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "roomId": "uuid",
    "roomNumber": "string",
    "capacity": 1
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Room updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Room not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{roomId}/status`
**Summary:** Update room operational status

**Path Parameters:**
- `roomId` (uuid): Room ID

**Request Body:**
```json
{
  "status": "READY|OCCUPIED|MAINTENANCE"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "roomId": "uuid",
    "status": "READY|OCCUPIED|MAINTENANCE"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Status updated
- `404 Not Found` – Room not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### DELETE `/{roomId}`
**Summary:** Soft-delete (deactivate) a room

**Path Parameters:**
- `roomId` (uuid): Room ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Room deactivated",
  "data": null
}
```

**HTTP Status Codes:**
- `200 OK` – Room deactivated
- `404 Not Found` – Room not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Slot Controller

**Base Path:** `/api/v1/admin/slots`
**Description:** Doctor time slot generation and management

#### POST `/generate`
**Summary:** Generate time slots from schedule templates

**Request Body:**
```json
{
  "doctorId": "uuid|null",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Slot generation complete",
  "data": {
    "totalSlotsGenerated": 50,
    "doctorsProcessed": 5,
    "dateRange": {
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    },
    "summary": "Successfully generated 50 slots for 5 doctors"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Slots generated
- `400 Bad Request` – Invalid date range
- `404 Not Found` – Doctor or template not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{slotId}/block`
**Summary:** Manually block a time slot

**Path Parameters:**
- `slotId` (uuid): Slot ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Slot blocked",
  "data": {
    "slotId": "uuid",
    "status": "BLOCKED",
    "startTime": "HH:MM",
    "endTime": "HH:MM"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Slot blocked
- `404 Not Found` – Slot not found
- `409 Conflict` – Slot is already booked
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### DELETE `/{slotId}`
**Summary:** Delete a time slot

**Path Parameters:**
- `slotId` (uuid): Slot ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Slot deleted",
  "data": null
}
```

**HTTP Status Codes:**
- `200 OK` – Slot deleted
- `404 Not Found` – Slot not found
- `409 Conflict` – Slot is already booked
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Schedule Template Controller

**Base Path:** `/api/v1/admin/schedule-templates`
**Description:** Doctor schedule templates

#### GET `/`
**Summary:** List all doctor schedule templates

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "templateId": "uuid",
      "doctorId": "uuid",
      "doctorName": "string",
      "monday": "09:00-17:00",
      "tuesday": "09:00-17:00",
      "wednesday": "OFF",
      "thursday": "09:00-17:00",
      "friday": "09:00-17:00",
      "saturday": "OFF",
      "sunday": "OFF",
      "slotDuration": 30
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Templates retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create schedule template for doctor

**Request Body:**
```json
{
  "doctorId": "uuid",
  "monday": "09:00-17:00",
  "tuesday": "09:00-17:00",
  "wednesday": "OFF",
  "thursday": "09:00-17:00",
  "friday": "09:00-17:00",
  "saturday": "OFF",
  "sunday": "OFF",
  "slotDuration": 30
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "templateId": "uuid",
    "doctorId": "uuid",
    "slotDuration": 30
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Template created
- `400 Bad Request` – Invalid input
- `404 Not Found` – Doctor not found
- `409 Conflict` – Template already exists
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{templateId}`
**Summary:** Update schedule template

**Path Parameters:**
- `templateId` (uuid): Template ID

**Request Body:**
```json
{
  "monday": "08:00-18:00",
  "tuesday": "08:00-18:00",
  "wednesday": "08:00-13:00",
  "slotDuration": 30
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "templateId": "uuid",
    "doctorName": "string",
    "monday": "08:00-18:00"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Template updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Template not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Stats Controller

**Base Path:** `/api/v1/admin/stats`
**Description:** Hospital statistics and KPIs

#### GET `/`
**Summary:** Get system statistics snapshot

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "totalPatients": 5000,
    "activeDoctor": 50,
    "totalAppointments": 25000,
    "appointmentsThisMonth": 800,
    "totalRevenue": 500000.00,
    "revenueThisMonth": 50000.00,
    "averageAppointmentDuration": 30,
    "appointmentCompletionRate": 92.5
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Stats retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Monitoring Controller

**Base Path:** `/api/v1/admin/monitoring`
**Description:** System monitoring and operational metrics

#### GET `/`
**Summary:** Get system monitoring snapshot

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "systemStatus": "HEALTHY|DEGRADED|CRITICAL",
    "databaseStatus": "HEALTHY|UNHEALTHY",
    "apiLatency": 150,
    "errorRate": 0.001,
    "activeUsers": 42,
    "appointmentsQueuedToday": 25,
    "timestamp": "YYYY-MM-DD HH:MM"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Monitoring data retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Audit Log Controller

**Base Path:** `/api/v1/admin/audit-logs`
**Description:** System audit trail

#### GET `/`
**Summary:** List audit logs with filtering

**Query Parameters:**
- `entityType` (string, optional): Entity type (USER, APPOINTMENT, etc.)
- `action` (string, optional): Action type (CREATE, UPDATE, DELETE)
- `limit` (integer, default: 50): Maximum results

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "logId": "uuid",
      "entityType": "USER|APPOINTMENT|PATIENT",
      "entityId": "uuid",
      "action": "CREATE|UPDATE|DELETE|LOGIN",
      "performedBy": "string",
      "timestamp": "YYYY-MM-DD HH:MM",
      "details": "string|object"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Audit logs retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ACCOUNTANT` or `ROLE_ADMIN`

---

### Admin Content Controller

**Base Path:** `/api/v1/admin/content/sections`
**Description:** Hospital website content management

#### GET `/`
**Summary:** List all content sections

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "sectionId": "uuid",
      "sectionTitle": "string",
      "content": "string",
      "order": 1,
      "isActive": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Sections retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create new content section

**Request Body:**
```json
{
  "sectionTitle": "string",
  "content": "string",
  "order": 1
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sectionId": "uuid",
    "sectionTitle": "string",
    "order": 1,
    "isActive": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Section created
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{sectionId}`
**Summary:** Update content section

**Path Parameters:**
- `sectionId` (uuid): Section ID

**Request Body:**
```json
{
  "sectionTitle": "string",
  "content": "string",
  "order": 1
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "sectionId": "uuid",
    "sectionTitle": "string",
    "content": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Section updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Section not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin News Controller

**Base Path:** `/api/v1/admin/news`
**Description:** Hospital news and announcement management

#### GET `/`
**Summary:** List all news articles (admin view)

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "articleId": "uuid",
      "title": "string",
      "summary": "string",
      "content": "string",
      "publishDate": "YYYY-MM-DD",
      "category": "string",
      "isPublished": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Articles retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create new news article

**Request Body:**
```json
{
  "title": "string",
  "summary": "string",
  "content": "string",
  "category": "string",
  "publishDate": "YYYY-MM-DD"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "articleId": "uuid",
    "title": "string",
    "publishDate": "YYYY-MM-DD",
    "isPublished": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Article created
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{articleId}`
**Summary:** Update news article

**Path Parameters:**
- `articleId` (uuid): Article ID

**Request Body:**
```json
{
  "title": "string",
  "summary": "string",
  "content": "string",
  "category": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "articleId": "uuid",
    "title": "string",
    "updatedDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Article updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Article not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Knowledge Document Controller

**Base Path:** `/api/v1/admin/knowledge-documents`
**Description:** Internal assistant knowledge base management

#### GET `/`
**Summary:** List all knowledge documents

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "documentId": "uuid",
      "title": "string",
      "category": "string",
      "version": "string",
      "owner": "string",
      "status": "DRAFT|ACTIVE|REVOKED",
      "uploadDate": "YYYY-MM-DD"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Documents retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### GET `/{documentId}`
**Summary:** Get knowledge document details

**Path Parameters:**
- `documentId` (uuid): Document ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "documentId": "uuid",
    "title": "string",
    "category": "string",
    "content": "string",
    "version": "string",
    "owner": "string",
    "status": "DRAFT|ACTIVE|REVOKED",
    "uploadDate": "YYYY-MM-DD",
    "lastModifiedDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Document retrieved
- `404 Not Found` – Document not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### GET `/{documentId}/ingestion`
**Summary:** Get document ingestion status

**Path Parameters:**
- `documentId` (uuid): Document ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "documentId": "uuid",
    "ingestionStatus": "PENDING|PROCESSING|COMPLETED|FAILED",
    "chunksProcessed": 150,
    "embeddingsGenerated": 150,
    "lastIngestionDate": "YYYY-MM-DD HH:MM",
    "errorMessage": "string|null"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Ingestion status retrieved
- `404 Not Found` – Document not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Upload knowledge document

**Request Parameters (multipart/form-data):**
- `file` (file, required): Document file
- `title` (string, required): Document title
- `category` (string, required): Category
- `summary` (string, optional): Summary
- `version` (string, optional): Version
- `owner` (string, optional): Owner
- `effectiveDate` (YYYY-MM-DD, optional): Effective date
- `tags` (string, optional): Comma-separated tags

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "documentId": "uuid",
    "title": "string",
    "category": "string",
    "status": "DRAFT",
    "uploadDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Document uploaded
- `400 Bad Request` – Invalid file or missing required fields
- `413 Payload Too Large` – File exceeds 1MB
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/{documentId}/activate`
**Summary:** Activate knowledge document for assistant use

**Path Parameters:**
- `documentId` (uuid): Document ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "documentId": "uuid",
    "status": "ACTIVE",
    "activationDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Document activated
- `404 Not Found` – Document not found
- `409 Conflict` – Document not in DRAFT status
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/{documentId}/revoke`
**Summary:** Revoke knowledge document (remove from assistant)

**Path Parameters:**
- `documentId` (uuid): Document ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "documentId": "uuid",
    "status": "REVOKED",
    "revocationDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Document revoked
- `404 Not Found` – Document not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/{documentId}/reindex`
**Summary:** Reindex document in knowledge base

**Path Parameters:**
- `documentId` (uuid): Document ID

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "documentId": "uuid",
    "reindexStatus": "PROCESSING",
    "reindexStartTime": "YYYY-MM-DD HH:MM"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Reindexing started
- `404 Not Found` – Document not found
- `409 Conflict` – Document not in ACTIVE status
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Monitoring - Internal Assistant Controller

**Base Path:** `/api/v1/admin/monitoring/internal-assistant`
**Description:** Internal Assistant AI metrics and monitoring

#### GET `/`
**Summary:** Get internal assistant operational metrics

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "totalSessions": 1200,
    "sessionsThisMonth": 320,
    "sessionsThisWeek": 85,
    "totalMessages": 8500,
    "averageConfidence": 0.87,
    "topModes": [
      {
        "mode": "DIAGNOSIS_SUPPORT",
        "sessionCount": 400
      }
    ],
    "userSatisfactionRating": 4.5,
    "feedbackCount": 450
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Metrics retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Special Closure Controller

**Base Path:** `/api/v1/admin/special-closures`
**Description:** Special holiday and closure date management

#### GET `/`
**Summary:** List all special closure periods

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "closureId": "uuid",
      "name": "string",
      "description": "string",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Closures retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create special closure period

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "closureId": "uuid",
    "name": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Closure created
- `400 Bad Request` – Invalid dates
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{closureId}`
**Summary:** Update special closure period

**Path Parameters:**
- `closureId` (uuid): Closure ID

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "closureId": "uuid",
    "name": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Closure updated
- `400 Bad Request` – Invalid dates
- `404 Not Found` – Closure not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

### Admin Public Content Controller

**Base Path:** `/api/v1/admin/public-content`
**Description:** Public website content management

#### GET `/`
**Summary:** List public content items

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": [
    {
      "contentId": "uuid",
      "title": "string",
      "content": "string",
      "contentType": "ARTICLE|NOTICE|ANNOUNCEMENT",
      "publishedDate": "YYYY-MM-DD",
      "isPublished": true
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` – Content retrieved
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### POST `/`
**Summary:** Create public content

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "contentType": "ARTICLE|NOTICE|ANNOUNCEMENT"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "contentId": "uuid",
    "title": "string",
    "contentType": "ARTICLE|NOTICE|ANNOUNCEMENT",
    "isPublished": true
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Content created
- `400 Bad Request` – Invalid input
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

#### PUT `/{contentId}`
**Summary:** Update public content

**Path Parameters:**
- `contentId` (uuid): Content ID

**Request Body:**
```json
{
  "title": "string",
  "content": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "contentId": "uuid",
    "title": "string"
  }
}
```

**HTTP Status Codes:**
- `200 OK` – Content updated
- `400 Bad Request` – Invalid input
- `404 Not Found` – Content not found
- `401 Unauthorized` – Missing authentication

**Authorization:** `ROLE_ADMIN`

---

## Error Response Format

All error responses follow this standardized format:

```json
{
  "status": "error",
  "message": "string",
  "errors": [
    {
      "field": "string|null",
      "message": "string"
    }
  ],
  "timestamp": "YYYY-MM-DD HH:MM:SS"
}
```

### Common Error Codes

| HTTP Status | Error Type | Description |
|-------------|-----------|-------------|
| 400 | BAD_REQUEST | Malformed request or validation failure |
| 401 | UNAUTHORIZED | Missing or invalid authentication |
| 403 | FORBIDDEN | Authenticated but lacks permissions |
| 404 | NOT_FOUND | Resource doesn't exist |
| 409 | CONFLICT | Duplicate entry, state conflict, or constraint violation |
| 422 | UNPROCESSABLE_ENTITY | Semantically invalid data |
| 429 | RATE_LIMITED | Too many requests |
| 500 | INTERNAL_ERROR | Server error (details logged server-side) |
| 503 | SERVICE_UNAVAILABLE | Temporary service unavailable |

---

## Authentication & Authorization

### Authentication Methods

1. **Staff Authentication**: JWT token in `Authorization: Bearer {token}` header
2. **Patient Authentication**: JWT token in `Authorization: Bearer {token}` header or HttpOnly cookie
3. **Public Endpoints**: No authentication required

### Role-Based Access Control (RBAC)

| Role | Description | Access |
|------|-------------|--------|
| ADMIN | System administrator | All endpoints |
| DOCTOR | Medical doctor | Clinical, patient records, scheduling, internal assistant |
| NURSE | Nurse/clinical staff | Appointments, vital signs, queue, clinical data |
| ACCOUNTANT | Finance officer | Invoices, pricing, revenue reports, audit logs |
| PATIENT | Patient portal user | Own appointments, portal, lab results |

### Authorization Enforcement

- All endpoints except public require valid JWT token
- Field-level filtering applies (e.g., doctors see only their appointments)
- SQL injection prevention via parameterized queries
- XSS prevention via output encoding
- CSRF protection on state-changing operations

---

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authentication**: 10 login attempts per 15 minutes
- **Public APIs**: 50 requests per minute per IP

---

## HTTP Response Headers

```
X-Request-ID: {UUID}              # Unique request identifier
X-RateLimit-Limit: 100            # Rate limit ceiling
X-RateLimit-Remaining: 95         # Requests remaining
X-RateLimit-Reset: 1629878400     # Unix timestamp for reset
Content-Type: application/json    # Response format
Cache-Control: no-cache           # Cache directives (where applicable)
```

---

**End of API Documentation**
