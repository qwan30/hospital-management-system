# End-to-End Business Flow Activity Diagrams

This document details the activity flows (workflows) for the 7 core end-to-end clinical and administrative processes of the Hospital Management System.

---

## Flow 1: Public Booking

```mermaid
flowchart TD
    Start([🏁 Start]) --> BrowseDepts[Browse Departments]
    BrowseDepts --> SelectDept[Select Department]
    SelectDept --> BrowseDoctors[Browse Doctors]
    BrowseDoctors --> SelectDoctor[Select Doctor & Date]
    SelectDoctor --> QuerySlots[Query Available Slots]
    QuerySlots --> IsAvailable{Are slots available?}
    IsAvailable -- No --> SelectDoctor
    IsAvailable -- Yes --> SelectSlot[Select Time Slot]
    SelectSlot --> FillForm[Fill Patient Info & Symptoms]
    FillForm --> Submit[Submit Booking]
    Submit --> Validation{Validate Form & Slot Availability}
    Validation -- Invalid/Conflict --> ShowError[Show Error 400/409]
    ShowError --> FillForm
    Validation -- Valid --> SaveData[Save/Update Patient & Book Slot]
    SaveData --> CreateAppt[Create Appointment as CONFIRMED]
    CreateAppt --> LogAudit[Log Booking Created Audit Event]
    LogAudit --> ShowConfirmation[Show Booking Confirmation Code]
    ShowConfirmation --> End([🏁 End])
```

---

## Flow 2: Staff Authentication

```mermaid
flowchart TD
    Start([🏁 Start]) --> OpenLogin[Open Staff Login Page]
    OpenLogin --> EnterCreds[Enter Email & Password]
    EnterCreds --> Submit[Submit Credentials]
    Submit --> Verify[Verify Credentials & Active Status]
    Verify --> IsValid{Credentials Valid?}
    IsValid -- No --> ShowError[Show 401 Unauthorized Error]
    ShowError --> EnterCreds
    IsValid -- Yes --> GenTokens[Generate JWT & Set HTTP-only Refresh Cookie]
    GenTokens --> SaveSession[Store JWT & Role in sessionStorage]
    SaveSession --> GoDashboard[Redirect to Staff Dashboard]
    GoDashboard --> AccessResource[Access Protected Route / API]
    AccessResource --> JWTFilter{JWT Filter: Validate Access Token}
    JWTFilter -- Expired --> CallRefresh[Call /api/v1/auth/refresh]
    CallRefresh -- Refresh Valid --> GetNewJWT[Receive New JWT Access Token]
    GetNewJWT --> AccessResource
    CallRefresh -- Refresh Invalid/Expired --> RedirectLogin[Redirect to Login Page]
    RedirectLogin --> OpenLogin
    JWTFilter -- Valid --> CheckRBAC{Check Method/Route Role Permission}
    CheckRBAC -- Denied --> ShowForbidden[Return 403 Forbidden]
    CheckRBAC -- Allowed --> ExecBiz[Execute Business Operation]
    ExecBiz --> End([🏁 End])
```

---

## Flow 3: Queue Operations

```mermaid
flowchart TD
    Start([🏁 Start]) --> PatientArrives[Patient Arrives at Clinic]
    PatientArrives --> CheckIn[Receptionist Performs Check-In]
    CheckIn --> StateCheckedIn[State: CHECKED_IN]
    StateCheckedIn --> RecordVitals[Nurse Measures & Records Vital Signs]
    RecordVitals --> StateVitals[State: VITAL_SIGNS]
    StateVitals --> AssignRoom[Nurse Assigns Room & Doctor]
    AssignRoom --> StateAssigned[State: ASSIGNED]
    StateAssigned --> WaitRoom[Patient Waits at Consultation Room]
    WaitRoom --> DoctorCalls[Doctor Calls Patient]
    DoctorCalls --> StateCalled[State: IN_CONSULTATION]
    StateCalled --> PatientPresent{Is Patient Present?}
    PatientPresent -- No --> SkipPatient[Doctor Skips Patient]
    SkipPatient --> StateSkipped[State: SKIPPED]
    PatientPresent -- Yes --> StartConsult[Doctor Starts Consultation]
    StartConsult --> StateInProgress[State: IN_PROGRESS]
    StateInProgress --> PerformExam[Perform Examination & Diagnosis]
    PerformExam --> CompleteConsult[Doctor Completes Consultation]
    CompleteConsult --> StateDone[State: DONE]
    StateSkipped --> End([🏁 End])
    StateDone --> End
```

---

## Flow 4: Doctor Clinical

```mermaid
flowchart TD
    Start([🏁 Start]) --> OpenDashboard[Doctor Opens Dashboard]
    OpenDashboard --> SelectPatient[Select Active Patient in Queue]
    SelectPatient --> ReviewHistory[Review Patient History & Vital Signs]
    ReviewHistory --> Diagnose[Perform Examination & Enter Diagnosis]
    Diagnose --> AddPrescription[Add Prescription Items & Instructions]
    AddPrescription --> PreviewPDF{Preview Prescription PDF?}
    PreviewPDF -- Yes --> CallPreview[POST /medical-records/preview.pdf]
    CallPreview --> RenderPreview[Render PDF Preview in Browser]
    RenderPreview --> AddPrescription
    PreviewPDF -- No --> SubmitRecord[Submit Medical Record & Prescription]
    SubmitRecord --> SetFollowUp{Schedule Follow-Up Date?}
    SetFollowUp -- Yes --> BookFollowUp[Record Follow-Up Appointment Details]
    BookFollowUp --> CompleteAppt[Update Appointment Status to DONE]
    SetFollowUp -- No --> CompleteAppt
    CompleteAppt --> GenFinalPDF[Generate Final Signed PDF]
    GenFinalPDF --> SendEmail[Trigger Gmail API to Send Notification & PDF]
    SendEmail --> LogAudit[Log Consultation Completed Event]
    LogAudit --> End([🏁 End])
```

---

## Flow 5: Pharmacy Dispense

```mermaid
flowchart TD
    Start([🏁 Start]) --> OpenPharmacy[Pharmacist Opens Pharmacy Panel]
    OpenPharmacy --> SelectRx[Select Pending Prescription]
    SelectRx --> FetchRxItems[Retrieve Prescription Items]
    FetchRxItems --> LoopItems{For each item}
    LoopItems -- Next Item --> CheckStock[Check Stock for Drug]
    CheckStock --> IsSufficient{Is Stock Sufficient?}
    IsSufficient -- No --> OutOfStock[Flag Out of Stock / Hold Rx]
    OutOfStock --> EndRx[Hold or Notify Doctor]
    IsSufficient -- Yes --> FetchLots[Retrieve Active Lots for Drug]
    FetchLots --> ApplyFIFO[Select Earliest Expiring Lot - FIFO]
    ApplyFIFO --> CheckExpiry{Is Lot Valid & Unexpired?}
    CheckExpiry -- No --> AlertExpired[Trigger Expired Lot Alert & Select Next]
    AlertExpired --> ApplyFIFO
    CheckExpiry -- Yes --> DeductStock[POST /inventory/dispense]
    DeductStock --> WriteMovement[Record DISPENSE Inventory Movement]
    WriteMovement --> CheckThreshold{Is Lot Stock < Safety Threshold?}
    CheckThreshold -- Yes --> GenAlert[Trigger Low Stock Alert Email]
    CheckThreshold -- No --> NextItem
    GenAlert --> NextItem[Process Next Prescription Item]
    NextItem --> LoopItems
    LoopItems -- All Items Processed --> HandOut[Hand Medication to Patient]
    HandOut --> LogAudit[Log Dispensing Completed Event]
    LogAudit --> End([🏁 End])
```

---

## Flow 6: Billing

```mermaid
flowchart TD
    Start([🏁 Start]) --> ConsultationDone[Consultation / Services Completed]
    ConsultationDone --> CreateInvoice[POST /api/v1/invoices]
    CreateInvoice --> StateUnpaid[State: UNPAID]
    StateUnpaid --> PatientBilling[Patient Arrives at Billing Counter]
    PatientBilling --> PresentInvoice[Accountant Presents Invoice]
    PresentInvoice --> PaymentChoice{Does Patient Pay?}
    PaymentChoice -- Yes --> RecordPayment[POST /invoices/{id}/payments]
    RecordPayment --> StatePaid[State: PAID]
    RecordPayment --> PrintReceipt[Generate Payment Receipt PDF]
    PaymentChoice -- No / Dispute --> VoidInvoice[POST /invoices/{id}/void]
    VoidInvoice --> StateCancelled[State: CANCELLED]
    StatePaid --> ViewReports[Admin Accesses Revenue Reports]
    StateCancelled --> ViewReports
    ViewReports --> QueryReports[GET /reports/revenue/daily or monthly]
    QueryReports --> RenderAnalytics[Render Revenue Charts & Financial Dashboards]
    RenderAnalytics --> End([🏁 End])
```

---

## Flow 7: Patient Portal

```mermaid
flowchart TD
    Start([🏁 Start]) --> OpenPortal[Patient Opens Patient Portal]
    OpenPortal --> HasAccount{Has Portal Account?}
    HasAccount -- No --> ClaimAccount[Enter CCCD/CMND, Phone & DOB]
    ClaimAccount --> SubmitClaim[POST /patient-auth/claim]
    SubmitClaim --> PatientExists{Is Patient Record Seeded?}
    PatientExists -- No --> ShowError[Registration Error: Contact Front Desk]
    PatientExists -- Yes --> SetCreds[Set Password & Verify Email]
    SetCreds --> LoginStep
    HasAccount -- Yes --> LoginStep[Enter Email & Password]
    LoginStep --> SubmitLogin[POST /patient-auth/login]
    SubmitLogin --> IsValid{Credentials Valid?}
    IsValid -- No --> ShowLoginError[Display Authentication Error]
    ShowLoginError --> LoginStep
    IsValid -- Yes --> EnterDashboard[View Portal Dashboard Overview]
    EnterDashboard --> TabSelection[Select Portal Option]
    TabSelection --> ViewAppointments[View Upcoming & Past Appointments]
    TabSelection --> ViewLabs[View & Download Lab Test Results]
    TabSelection --> ManageProfile[View / Update Contact Profile]
    ViewAppointments --> ActionSelection{Perform action?}
    ViewLabs --> ActionSelection
    ManageProfile --> UpdateProfile[PUT /patient-portal/profile]
    UpdateProfile --> ActionSelection
    ActionSelection -- Logout --> TriggerLogout[POST /patient-auth/logout]
    TriggerLogout --> RedirectPublic[Redirect to Public Website]
    ActionSelection -- Continue --> TabSelection
    RedirectPublic --> End([🏁 End])
```
