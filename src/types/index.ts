export type UserRole = 'admin' | 'headmaster' | 'assistant_head' | 'faculty' | 'parent' | 'student';

export type AttendanceStatus = 'present' | 'absent' | 'tardy' | 'excused';

export type SchoolDepartment = 'Primary' | 'JHS' | 'SHS';

export interface School {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  headmasterId: string;
  headmasterName: string;
  phone: string;
  email: string;
  establishedYear: number;
  totalStudents?: number;
}

export interface Student {
  id: string;
  schoolId: string; // Multi-school support
  name: string;
  rollNumber: string;
  department: SchoolDepartment; // Primary or JHS
  gradeLevel: string; // e.g. "Primary 5", "JHS 2"
  section: string; // e.g. "A", "B"
  avatar: string;
  photoUpdatedAt?: string;
  photoUpdatedBy?: string;
  email: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  gpa: number;
  attendanceRate: number; // e.g. 96.5%
  feeStatus: 'paid' | 'pending' | 'overdue';
  encryptedMedicalNotes: string; // AES-GCM encrypted
  encryptedDisciplinaryNotes: string; // AES-GCM encrypted
  enrolledCourseIds: string[];
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  period: number;
  notes?: string;
  notificationSent: boolean;
  notifiedAt?: string;
  updatedAt: string;
  updatedBy: string;
}

export type GradeCategory = 'exam' | 'quiz' | 'homework' | 'project';

export interface GradeItem {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  title: string;
  category: GradeCategory;
  score: number;
  maxScore: number;
  percentage: number; // Stored explicitly in percentage (e.g. 94.0%)
  weight: number; // percentage of term
  date: string;
  remarks?: string;
  updatedAt: string; // Timestamp of modification
  updatedBy: string; // Name and role of person who made change
}

export interface Course {
  id: string;
  schoolId: string;
  code: string;
  name: string;
  department: SchoolDepartment; // Primary or JHS
  facultyId: string;
  facultyName: string;
  coTeachers?: string[]; // additional teachers teaching this subject
  room: string;
  gradeLevel: string; // e.g. "Primary 5", "JHS 2"
  credits: number;
  color: string;
  updatedAt: string;
  updatedBy: string;
}

export interface FacultyMember {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  phone: string;
  department: SchoolDepartment; // Primary or JHS
  designation: string;
  avatar: string;
  courseIds: string[];
  workloadHours: number;
  officeHours: string;
  status: 'active' | 'on_leave';
  assignedBy?: string;
  assignedAt?: string;
}

export interface TimetableSlot {
  id: string;
  schoolId: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
  period: number; // 1 through 7
  startTime: string;
  endTime: string;
  courseId: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  room: string;
  gradeLevel: string;
  department: SchoolDepartment;
  updatedAt: string;
  updatedBy: string;
}

export type NotificationType = 'attendance' | 'academic' | 'fee_due' | 'payment_receipt' | 'announcement';
export type NotificationChannel = 'sms' | 'email' | 'push';

export interface NotificationLog {
  id: string;
  schoolId: string;
  recipientName: string;
  recipientRole: UserRole;
  recipientContact: string; // phone or email
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  priority: 'high' | 'normal';
}

export interface AuditChangeLog {
  id: string;
  schoolId: string;
  timestamp: string; // e.g. "2026-10-15 08:35:22"
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: 'grade' | 'student_photo' | 'subject' | 'attendance' | 'teacher_assignment' | 'school' | 'boarding_student' | 'exeat_pass' | 'assistant_head' | 'dormitory_change' | 'homework';
  targetName: string;
  details: string;
}

export interface ParentAccount {
  id: string;
  name: string;
  phone: string; // Used for SMS alerts
  email: string;
  linkedStudentRollNumbers: string[];
  createdAt: string;
}

export type FeeCategory = 'tuition' | 'lab' | 'athletics' | 'meals' | 'transport';

export interface FeeInvoice {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  gradeLevel: string;
  description: string;
  category: FeeCategory;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  term: string;
  paymentDetails?: {
    cardBrand: 'Visa' | 'Mastercard' | 'Other';
    last4: string;
    transactionId: string;
    authCode: string;
    paidAt: string;
    encryptedCardToken?: string;
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingCycle: 'termly' | 'monthly' | 'annual';
  amount: number;
  savingsPercentage?: number;
  description: string;
  isPopular?: boolean;
  features: string[];
}

export interface EncryptedDataPayload {
  ciphertext: string; // base64
  iv: string; // base64
  salt: string; // base64
  algorithm: string;
  timestamp: string;
}

// ── BOARDING & EXEAT PASS SYSTEM ──
export interface BoardingStudent {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: SchoolDepartment;
  gradeLevel: string;
  dormitoryHouse: string; // e.g., Aggrey Hall, Yaa Asantewaa House
  roomNumber: string;
  bedNumber: string;
  houseMasterName: string;
  guardianPhone: string;
  status: 'in_residence' | 'on_exeat' | 'suspended';
  avatar: string;
  updatedAt: string;
  updatedBy: string;
}

export type ExeatReason = 'medical' | 'family_emergency' | 'weekend_home' | 'academic_competition' | 'official';
export type ExeatStatus = 'pending' | 'approved' | 'active' | 'returned' | 'overdue';

export interface ExeatPass {
  id: string;
  schoolId: string;
  boardingStudentId: string;
  studentName: string;
  rollNumber: string;
  dormitoryHouse: string;
  reason: ExeatReason;
  destinationAddress: string;
  parentContact: string; // For automated SMS confirmation
  departureTime: string; // YYYY-MM-DD HH:mm
  expectedReturnTime: string;
  actualReturnTime?: string;
  status: ExeatStatus;
  approvedBy: string;
  approvedByRole: 'headmaster' | 'assistant_head' | 'faculty';
  approvedAt: string;
  parentSmsDispatched: boolean;
  notes?: string;
  gatePassToken: string;
  updatedAt: string;
  updatedBy: string;
}

// ── ASSISTANT HEADMASTER PROFILE ──
export interface AssistantHead {
  id: string;
  schoolId: string;
  facultyId: string;
  name: string;
  portfolio: 'Academics' | 'Administration' | 'Domestic & Boarding' | 'Student Affairs';
  appointedByHeadmaster: string;
  appointedAt: string;
  canApproveExeat: boolean;
  canManageSchedules: boolean;
  phone: string;
  email: string;
}

// ── ACCESSIBILITY & ASSISTIVE TECHNOLOGY TYPES ──
export type ContrastTheme = 'default' | 'high-contrast-yellow' | 'high-contrast-black' | 'high-contrast-white';
export type FontScale = 100 | 125 | 150 | 175 | 200;
export type SpacingScale = 'normal' | 'relaxed' | 'wide';

export interface AccessibilitySettings {
  contrastTheme: ContrastTheme;
  fontScale: FontScale;
  hyperLegibleFont: boolean;
  spacingScale: SpacingScale;
  screenReaderActive: boolean;
  speechRate: number; // 0.75, 1.0, 1.25, 1.5, 2.0
  autoSpeakOnTouch: boolean; // Blind user touches screen -> voice reads control aloud
  soundFeedback: boolean; // Audio chime on actions
  hapticFeedback: boolean; // Tactile phone vibration for blind users
  screenMagnifier: boolean; // Visual magnifier lens for partial blindness
  magnifierZoom: number; // 1.5x, 2.0x, 2.5x
  highlightLinks: boolean;
  highVisibilityFocus: boolean;
  // ── HOVER & CLICK VOICE NARRATOR ──
  narratorActive: boolean; // Speak and describe buttons and elements on hover or click
  narrateOnHover: boolean; // Read elements when hovered or focused
  narrateOnClick: boolean; // Read elements when clicked or tapped
  narratorVerbosity: 'concise' | 'detailed';
}

// ── HOMEWORK & STUDENT ASSIGNMENT SUBMISSION ──
export interface HomeworkAssignment {
  id: string;
  schoolId: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  gradeLevel: string;
  department: SchoolDepartment;
  dueDate: string;
  maxPoints: number; // e.g. 100
  weightPercentage: number; // e.g. 20%
  instructions?: string;
  createdAt: string;
}

export interface HomeworkSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  courseName: string;
  submissionText: string;
  attachmentFileName?: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'pending';
  score?: number; // e.g. 92
  maxPoints: number; // 100
  percentage?: number; // 92%
  teacherFeedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}


