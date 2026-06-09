import type { Page, Request, Route } from '@playwright/test';
import { mockAdminUserId, mockMedicalRecordAppointmentId } from './routes';

const adminUsers = [
  {
    userId: mockAdminUserId,
    email: 'sarah.kingston@hospital-core.test',
    fullName: 'Sarah Kingston',
    phone: '+84900000101',
    role: 'DOCTOR',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    specialty: 'Interventional Cardiology',
    qualification: 'MD, FACC',
    experienceYears: 12,
    active: true,
  },
  {
    userId: 'MC-1044',
    email: 'marcus.bennett@hospital-core.test',
    fullName: 'Marcus Bennett',
    phone: '+84900000102',
    role: 'NURSE',
    departmentId: 'dept-neuro',
    departmentName: 'Neurology',
    specialty: 'Critical Care',
    qualification: 'RN',
    experienceYears: 7,
    active: true,
  },
  {
    userId: 'MC-1160',
    email: 'elena.lopez@hospital-core.test',
    fullName: 'Elena Lopez',
    phone: '+84900000103',
    role: 'RECEPTIONIST',
    departmentId: null,
    departmentName: null,
    specialty: null,
    qualification: null,
    experienceYears: 4,
    active: true,
  },
];

const adminUserDetail = {
  ...adminUsers[0],
  fullName: 'Sarah Jenkins',
  email: 'sarah.jenkins@hospital-core.test',
};

const adminDepartments = [
  {
    departmentId: 'dept-cardio',
    name: 'Cardiology',
    description: 'Cardiac care and intervention',
    imageUrl: null,
    phone: '+84900000201',
    active: true,
  },
  {
    departmentId: 'dept-neuro',
    name: 'Neurology',
    description: 'Neurological diagnostics and treatment',
    imageUrl: null,
    phone: '+84900000202',
    active: true,
  },
];

const adminRooms = [
  {
    roomId: 'room-101',
    name: 'CARD-101',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    status: 'READY',
    active: true,
  },
  {
    roomId: 'room-202',
    name: 'NEU-202',
    departmentId: 'dept-neuro',
    departmentName: 'Neurology',
    status: 'IN_USE',
    active: true,
  },
];

const adminContentSections = [
  {
    id: 'content-hero',
    slug: 'hero',
    title: 'Hero Landing Configuration',
    body: 'Precision Healthcare for Every Life.',
    imageUrl: '/images/hospital-core-hero.jpg',
    ctaLabel: 'Book appointment',
    ctaHref: '/booking',
    sortOrder: 1,
  },
];

const pricingRules = [
  {
    pricingId: 'pricing-1',
    departmentId: 'dept-cardio',
    departmentName: 'Cardiology',
    serviceName: 'Consultation',
    amount: 125,
    effectiveDate: '2026-09-01',
  },
];

const appointmentDetail = {
  appointmentId: mockMedicalRecordAppointmentId,
  confirmationCode: 'Q-1001',
  status: 'CHECKED_IN',
  appointmentDate: '2026-09-15',
  startTime: '09:00:00',
  endTime: '09:30:00',
  checkedInAt: '2026-09-15T08:50:00Z',
  aiDurationMinutes: 30,
  symptoms: 'Follow-up consultation',
  doctorId: 'doctor-1',
  doctorName: 'Dr. Sarah Jenkins',
  patientId: 'patient-1',
  patientFullName: 'Alexander Vance',
  patientPhone: '+84900000301',
  patientCccd: '012345678901',
  patientEmail: 'alexander.vance@example.test',
  patientDateOfBirth: '1988-04-12',
  patientGender: 'MALE',
};

const portalAppointments = [
  {
    appointmentId: 'portal-appointment-1',
    confirmationCode: 'PC-1001',
    appointmentDate: '2026-10-01',
    startTime: '10:00:00',
    endTime: '10:30:00',
    doctorName: 'Dr. Sarah Jenkins',
    status: 'CONFIRMED',
  },
  {
    appointmentId: 'portal-appointment-2',
    confirmationCode: 'PC-1002',
    appointmentDate: '2026-10-15',
    startTime: '13:00:00',
    endTime: '13:30:00',
    doctorName: 'Dr. Michael Chen',
    status: 'CONFIRMED',
  },
  {
    appointmentId: 'portal-appointment-3',
    confirmationCode: 'PC-1003',
    appointmentDate: '2026-11-02',
    startTime: '15:00:00',
    endTime: '15:30:00',
    doctorName: 'Dr. Elena Rodriguez',
    status: 'CONFIRMED',
  },
];

const portalMessages = [
  {
    threadId: 'thread-1',
    subject: 'Follow-up: Lab results review',
    channel: 'Internal Medicine',
    unreadCount: 1,
    lastMessagePreview: 'Please review your latest complete blood count results.',
    updatedAt: '2026-09-15T09:00:00Z',
    messages: [
      {
        messageId: 'message-1',
        senderRole: 'Dr. Alistair Vance',
        body: 'Your lab results are available for review.',
        createdAt: '2026-09-15T09:00:00Z',
      },
    ],
  },
  {
    threadId: 'thread-2',
    subject: 'Portal account notice',
    channel: 'System Administrator',
    unreadCount: 0,
    lastMessagePreview: 'Your profile security settings were reviewed.',
    updatedAt: '2026-09-14T14:00:00Z',
    messages: [],
  },
];

const portalProfile = {
  patientId: 'PCU-992-04-X',
  fullName: 'Alexander Vance',
  email: 'alexander.vance@example.test',
  phone: '+84900000401',
  dateOfBirth: '1988-04-12',
  occupation: 'Product Designer',
  bloodType: 'O+',
  medicalHistory: 'Seasonal allergies',
  drugAllergies: 'Penicillin',
  insuranceNumber: 'INS-992-04-X',
};

const portalLabResults = [
  {
    labResultId: 'lab-1',
    appointmentId: 'portal-appointment-1',
    testName: 'Complete Blood Count',
    status: 'Reviewed',
    resultSummary: 'Values are within the expected range.',
    doctorComment: 'Continue the current care plan.',
    attachmentUrl: '/demo-cbc.pdf',
    collectedAt: '2026-09-10T08:00:00Z',
  },
];

const staffScheduleAppointments = [
  {
    appointmentId: 'sched-1',
    confirmationCode: 'SC-1001',
    status: 'CONFIRMED',
    appointmentDate: '2026-09-18',
    startTime: '09:00:00',
    endTime: '09:30:00',
    checkedInAt: null,
    doctorId: 'doctor-1',
    doctorName: 'Dr. Sarah Jenkins',
    patientId: 'patient-1',
    patientFullName: 'Alexander Vance',
    patientPhone: '+84900000301',
    patientCccd: '012345678901',
  },
  {
    appointmentId: 'sched-2',
    confirmationCode: 'SC-1002',
    status: 'PENDING',
    appointmentDate: '2026-09-18',
    startTime: '10:00:00',
    endTime: '10:30:00',
    checkedInAt: null,
    doctorId: 'doctor-1',
    doctorName: 'Dr. Sarah Jenkins',
    patientId: 'patient-2',
    patientFullName: 'Maria Chen',
    patientPhone: '+84900000302',
    patientCccd: '012345678902',
  },
];

const staffLabResults = [
  {
    labResultId: 'staff-lr-1',
    appointmentId: mockMedicalRecordAppointmentId,
    testName: 'Complete Blood Count',
    status: 'Reviewed',
    resultSummary: 'Hemoglobin within normal range.',
    doctorComment: 'Continue current treatment.',
    attachmentUrl: null,
    collectedAt: '2026-09-15T08:00:00Z',
  },
];

const staffAppointmentsList = [
  {
    appointmentId: mockMedicalRecordAppointmentId,
    confirmationCode: 'Q-1001',
    status: 'DONE',
    appointmentDate: '2026-09-15',
    startTime: '09:00:00',
    endTime: '09:30:00',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Sarah Jenkins',
    patientId: 'patient-1',
    patientName: 'Alexander Vance',
    patientPhone: '+84900000301',
    symptoms: null,
    createdAt: '2026-09-14T10:00:00Z',
  },
];

const publicDoctors = [
  {
    id: 'doctor-1',
    departmentId: 'dept-cardio',
    fullName: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@hospital-core.test',
    specialty: 'Cardiology',
    qualification: 'MD',
    experienceYears: 12,
  }
];

const publicSlots = [
  {
    id: 'slot-1',
    doctorId: 'doctor-1',
    slotDate: '2026-09-18',
    startTime: '09:00:00',
    endTime: '09:30:00',
    status: 'AVAILABLE',
  }
];

export async function installUiApiMocks(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request();
    const { pathname } = new URL(request.url());
    const apiPath = pathname.replace(/^\/api\/v1/, '');
    const method = request.method().toUpperCase();

    if (method === 'GET' && apiPath === '/doctors') {
      return fulfillJson(route, publicDoctors);
    }
    if (method === 'GET' && /^\/doctors\/[^/]+\/slots/.test(apiPath)) {
      return fulfillJson(route, publicSlots);
    }
    if (method === 'GET' && apiPath === '/admin/users') {
      return fulfillJson(route, adminUsers);
    }
    if (method === 'GET' && apiPath.startsWith('/admin/users/')) {
      return fulfillJson(route, adminUserDetail);
    }
    if (method === 'GET' && apiPath === '/admin/departments') {
      return fulfillJson(route, adminDepartments);
    }
    if (method === 'GET' && apiPath === '/admin/rooms') {
      return fulfillJson(route, adminRooms);
    }
    if (method === 'GET' && apiPath === '/admin/content/sections') {
      return fulfillJson(route, adminContentSections);
    }
    if (method === 'GET' && apiPath === '/pricing') {
      return fulfillJson(route, pricingRules);
    }
    if (method === 'GET' && /^\/appointments\/[^/]+$/.test(apiPath)) {
      return fulfillJson(route, appointmentDetail);
    }
    if (method === 'GET' && apiPath === '/patient-portal/appointments') {
      return fulfillJson(route, portalAppointments);
    }
    if (method === 'GET' && apiPath === '/patient-portal/messages') {
      return fulfillJson(route, portalMessages);
    }
    if (method === 'GET' && apiPath === '/patient-portal/profile') {
      return fulfillJson(route, portalProfile);
    }
    if (method === 'GET' && apiPath === '/patient-portal/lab-results') {
      return fulfillJson(route, portalLabResults);
    }

    // Staff schedule
    if (method === 'GET' && apiPath.startsWith('/me/schedule')) {
      return fulfillJson(route, staffScheduleAppointments);
    }

    // Staff lab results by appointment
    if (method === 'GET' && /^\/appointments\/[^/]+\/lab-results$/.test(apiPath)) {
      return fulfillJson(route, staffLabResults);
    }

    // Staff lab result detail
    if (method === 'GET' && /^\/lab-results\/[^/]+$/.test(apiPath)) {
      return fulfillJson(route, staffLabResults[0] ?? null);
    }

    // Staff lab result create
    if (method === 'POST' && apiPath === '/lab-results') {
      const body = safePostDataJson(request);
      return fulfillJson(route, {
        id: 'staff-lr-new',
        appointmentId: body.appointmentId ?? mockMedicalRecordAppointmentId,
        testName: body.testName ?? 'Recorded Lab Result',
        resultValue: body.resultValue ?? 'Recorded value',
        referenceRange: body.referenceRange ?? null,
        status: body.status ?? 'COMPLETED',
        notes: body.notes ?? null,
        deleted: false,
        createdAt: '2026-09-15T10:00:00Z',
      });
    }

    // Staff appointments list (for lab results page loading)
    if (method === 'GET' && apiPath === '/appointments') {
      return fulfillJson(route, staffAppointmentsList);
    }

    return fulfillJson(route, null);
  });
}

async function fulfillJson(route: Route, data: unknown) {
  await route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ success: true, data }),
  });
}

function safePostDataJson(request: Request) {
  try {
    return request.postDataJSON() as Record<string, string | null>;
  } catch {
    return {};
  }
}
