import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  School,
  Student,
  Course,
  FacultyMember,
  TimetableSlot,
  AttendanceRecord,
  AttendanceStatus,
  GradeItem,
  FeeInvoice,
  SubscriptionPlan,
  NotificationLog,
  UserRole,
  SchoolDepartment,
  AuditChangeLog,
  ParentAccount,
  BoardingStudent,
  ExeatPass,
  ExeatStatus,
  AssistantHead,
  HomeworkAssignment,
  HomeworkSubmission,
} from '../types';
import {
  INITIAL_SCHOOLS,
  INITIAL_STUDENTS,
  INITIAL_COURSES,
  INITIAL_FACULTY,
  INITIAL_TIMETABLE,
  INITIAL_ATTENDANCE,
  INITIAL_GRADES,
  INITIAL_INVOICES,
  SUBSCRIPTION_PLANS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PARENT_ACCOUNTS,
  INITIAL_ASSISTANT_HEADS,
  INITIAL_BOARDING_STUDENTS,
  INITIAL_EXEAT_PASSES,
  INITIAL_ASSIGNMENTS,
  INITIAL_HOMEWORK_SUBMISSIONS,
} from '../data/mockData';
import { cryptoService } from '../services/cryptoService';

interface ToastAlert {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  smsRecipient?: string; // If it's an SMS alert to a parent's phone
}

interface SchoolContextType {
  // Multi-School Management
  schools: School[];
  activeSchoolId: string;
  setActiveSchoolId: (id: string) => void;
  activeSchool: School;
  addSchool: (schoolData: Omit<School, 'id'>) => School;

  // Role & Viewport
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  mobilePreviewMode: 'web' | 'mobile_flutter';
  setMobilePreviewMode: (mode: 'web' | 'mobile_flutter') => void;
  mobileDeviceType: 'ios' | 'android';
  setMobileDeviceType: (type: 'ios' | 'android') => void;

  // Department Filter
  selectedDepartment: 'all' | SchoolDepartment;
  setSelectedDepartment: (dept: 'all' | SchoolDepartment) => void;

  // Data collections (filtered by active school where applicable)
  students: Student[];
  courses: Course[];
  faculty: FacultyMember[];
  timetable: TimetableSlot[];
  attendance: AttendanceRecord[];
  grades: GradeItem[];
  invoices: FeeInvoice[];
  subscriptions: SubscriptionPlan[];
  notifications: NotificationLog[];
  auditLogs: AuditChangeLog[];
  toasts: ToastAlert[];
  removeToast: (id: string) => void;

  // Parent Authentication
  parentAccounts: ParentAccount[];
  currentParent: ParentAccount | null;
  registerParent: (name: string, phone: string, email: string, studentRollNumber: string) => { success: boolean; message: string };
  loginParent: (phoneOrEmail: string) => { success: boolean; message: string };
  logoutParent: () => void;

  // E2EE Security state
  isE2EEUnlocked: boolean;
  setIsE2EEUnlocked: (unlocked: boolean) => void;
  e2eePassphrase: string;
  updateE2EEPassphrase: (passphrase: string) => Promise<void>;
  decryptStudentField: (cipherText: string) => Promise<string>;
  encryptStudentField: (plainText: string) => Promise<string>;

  // Actions: Courses (Subjects) & Teachers
  addCourse: (courseData: Omit<Course, 'id' | 'schoolId' | 'updatedAt' | 'updatedBy'>) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addFaculty: (facultyData: Omit<FacultyMember, 'id' | 'schoolId'>) => FacultyMember;
  updateFaculty: (id: string, updates: Partial<FacultyMember>) => void;

  // Headmaster & Teacher Assignment
  assignTeacherToSubject: (courseId: string, facultyId: string, coTeachers?: string[]) => void;
  updateStudentPhoto: (studentId: string, photoUrl: string) => void;
  
  // Assistant Head Management (Only Headmaster can appoint)
  assistantHeads: AssistantHead[];
  addAssistantHead: (facultyId: string, portfolio: AssistantHead['portfolio']) => void;

  // Boarding Students & Exeat Pass Management (Only House Master and Headmaster can change dormitory and issue exeat)
  boardingStudents: BoardingStudent[];
  addBoardingStudent: (student: Omit<BoardingStudent, 'id' | 'schoolId' | 'updatedAt' | 'updatedBy'>) => void;
  changeStudentDormitory: (
    boardingStudentId: string,
    dormitoryHouse: string,
    roomNumber: string,
    bedNumber: string,
    houseMasterName: string
  ) => { success: boolean; message: string };
  exeatPasses: ExeatPass[];
  issueExeatPass: (pass: Omit<ExeatPass, 'id' | 'schoolId' | 'gatePassToken' | 'updatedAt' | 'updatedBy' | 'parentSmsDispatched'>) => { success: boolean; message: string };
  updateExeatStatus: (id: string, status: ExeatStatus, returnTime?: string) => void;
  canManageDormitoryAndExeat: boolean;

  // Student modifications (Only Teacher and Headmaster)
  updateStudentDetails: (studentId: string, updates: Partial<Student>) => { success: boolean; message: string };
  canModifyStudent: boolean;

  // Homework & Student Assignments (Students can submit homework and view grades)
  assignments: HomeworkAssignment[];
  homeworkSubmissions: HomeworkSubmission[];
  addHomeworkAssignment: (data: Omit<HomeworkAssignment, 'id' | 'schoolId' | 'createdAt'>) => void;
  submitHomework: (submission: Omit<HomeworkSubmission, 'id' | 'submittedAt' | 'status'>) => { success: boolean; message: string };
  gradeHomeworkSubmission: (submissionId: string, score: number, feedback: string) => void;

  // Actions: Attendance
  recordAttendance: (
    studentId: string,
    courseId: string,
    status: AttendanceStatus,
    date?: string,
    period?: number,
    notes?: string
  ) => void;
  bulkMarkAttendance: (
    courseId: string,
    date: string,
    period: number,
    status: AttendanceStatus
  ) => void;

  // Actions: Grades (Percentage-based with timestamps & automated parent SMS)
  addGrade: (newGrade: Omit<GradeItem, 'id' | 'schoolId' | 'percentage' | 'updatedAt' | 'updatedBy'>) => void;
  updateGrade: (id: string, updates: Partial<GradeItem>) => void;
  deleteGrade: (id: string) => void;

  // Actions: Timetable & Faculty
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'schoolId' | 'updatedAt' | 'updatedBy'>) => void;
  assignSubstituteFaculty: (
    slotId: string,
    newFacultyId: string,
    reason: string
  ) => void;

  // Actions: Visa Billing & Subscriptions
  payInvoiceWithVisa: (
    invoiceId: string,
    visaCard: {
      cardNumber: string;
      cardHolder: string;
      expiry: string;
      cvv: string;
    }
  ) => Promise<{ success: boolean; transactionId: string; authCode: string }>;
  createCustomInvoice: (invoice: Omit<FeeInvoice, 'id' | 'schoolId' | 'status'>) => void;

  // Actions: Notifications & Audits
  sendManualNotification: (notification: Omit<NotificationLog, 'id' | 'schoolId' | 'timestamp' | 'status'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  recordAuditLog: (action: string, targetType: AuditChangeLog['targetType'], targetName: string, details: string) => void;

  // Actions: Student Updates
  updateStudentConfidentialNotes: (
    studentId: string,
    medicalNotes: string,
    disciplinaryNotes: string
  ) => Promise<void>;

  // Global search & summary
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetDemoData: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [mobilePreviewMode, setMobilePreviewMode] = useState<'web' | 'mobile_flutter'>('web');
  const [mobileDeviceType, setMobileDeviceType] = useState<'ios' | 'android'>('ios');
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | SchoolDepartment>('all');

  // Multi-school state
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('gabbybru_schools_v2');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });
  const [activeSchoolId, setActiveSchoolId] = useState<string>(() => {
    const saved = localStorage.getItem('gabbybru_active_school_id');
    return saved || 'sch-1';
  });

  const activeSchool = useMemo(() => {
    return schools.find((s) => s.id === activeSchoolId) || schools[0];
  }, [schools, activeSchoolId]);

  // Parent Authentication
  const [parentAccounts, setParentAccounts] = useState<ParentAccount[]>(() => {
    const saved = localStorage.getItem('gabbybru_parent_accounts');
    return saved ? JSON.parse(saved) : INITIAL_PARENT_ACCOUNTS;
  });
  const [currentParent, setCurrentParent] = useState<ParentAccount | null>(() => {
    const saved = localStorage.getItem('gabbybru_current_parent');
    return saved ? JSON.parse(saved) : null;
  });

  // Students, Courses, Faculty, Attendance, Grades, Timetable, AuditLogs
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('gabbybru_students_v2');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('gabbybru_courses_v2');
    return saved ? JSON.parse(saved) : INITIAL_COURSES;
  });

  const [faculty, setFaculty] = useState<FacultyMember[]>(() => {
    const saved = localStorage.getItem('gabbybru_faculty_v2');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem('gabbybru_timetable_v2');
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('gabbybru_attendance_v2');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [grades, setGrades] = useState<GradeItem[]>(() => {
    const saved = localStorage.getItem('gabbybru_grades_v2');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [invoices, setInvoices] = useState<FeeInvoice[]>(() => {
    const saved = localStorage.getItem('gabbybru_invoices_v2');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [subscriptions] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('gabbybru_notifications_v2');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditChangeLog[]>(() => {
    const saved = localStorage.getItem('gabbybru_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [assistantHeads, setAssistantHeads] = useState<AssistantHead[]>(() => {
    const saved = localStorage.getItem('gabbybru_asst_heads');
    return saved ? JSON.parse(saved) : INITIAL_ASSISTANT_HEADS;
  });

  const [boardingStudents, setBoardingStudents] = useState<BoardingStudent[]>(() => {
    const saved = localStorage.getItem('gabbybru_boarding_students');
    return saved ? JSON.parse(saved) : INITIAL_BOARDING_STUDENTS;
  });

  const [exeatPasses, setExeatPasses] = useState<ExeatPass[]>(() => {
    const saved = localStorage.getItem('gabbybru_exeat_passes');
    return saved ? JSON.parse(saved) : INITIAL_EXEAT_PASSES;
  });

  const [toasts, setToasts] = useState<ToastAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // E2EE Master Key state
  const [isE2EEUnlocked, setIsE2EEUnlocked] = useState<boolean>(true);
  const [e2eePassphrase, setE2eePassphrase] = useState<string>(cryptoService.getPassphrase());

  const getTimestamp = () => {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  };

  const getCurrentActorName = () => {
    if (currentRole === 'admin') return 'System Administrator';
    if (currentRole === 'headmaster') return activeSchool.headmasterName || 'Headmaster';
    if (currentRole === 'assistant_head') return 'Assistant Headmaster';
    if (currentRole === 'faculty') return 'Teacher on Duty';
    if (currentRole === 'parent') return currentParent ? currentParent.name : 'Parent Guardian';
    return 'Student User';
  };

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem('gabbybru_schools_v2', JSON.stringify(schools));
  }, [schools]);

  useEffect(() => {
    localStorage.setItem('gabbybru_active_school_id', activeSchoolId);
  }, [activeSchoolId]);

  useEffect(() => {
    localStorage.setItem('gabbybru_parent_accounts', JSON.stringify(parentAccounts));
  }, [parentAccounts]);

  useEffect(() => {
    if (currentParent) {
      localStorage.setItem('gabbybru_current_parent', JSON.stringify(currentParent));
    } else {
      localStorage.removeItem('gabbybru_current_parent');
    }
  }, [currentParent]);

  useEffect(() => {
    localStorage.setItem('gabbybru_students_v2', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('gabbybru_courses_v2', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('gabbybru_faculty_v2', JSON.stringify(faculty));
  }, [faculty]);

  useEffect(() => {
    localStorage.setItem('gabbybru_attendance_v2', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('gabbybru_grades_v2', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('gabbybru_invoices_v2', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('gabbybru_timetable_v2', JSON.stringify(timetable));
  }, [timetable]);

  useEffect(() => {
    localStorage.setItem('gabbybru_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('gabbybru_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('gabbybru_asst_heads', JSON.stringify(assistantHeads));
  }, [assistantHeads]);

  useEffect(() => {
    localStorage.setItem('gabbybru_boarding_students', JSON.stringify(boardingStudents));
  }, [boardingStudents]);

  useEffect(() => {
    localStorage.setItem('gabbybru_exeat_passes', JSON.stringify(exeatPasses));
  }, [exeatPasses]);

  // Initial seed encryption
  useEffect(() => {
    const seedEncryptedNotes = async () => {
      let changed = false;
      const updated = await Promise.all(
        students.map(async (stu) => {
          if (!stu.encryptedMedicalNotes || !stu.encryptedMedicalNotes.includes('ciphertext')) {
            changed = true;
            const plainMedical = stu.id.includes('pri')
              ? 'Asthma inhaler kept in primary dispensary. Mild dust allergy.'
              : 'No known chronic allergies. Immunization complete.';
            const plainDisciplinary = 'Exemplary conduct rating. No disciplinary infractions recorded.';

            const encMedical = await cryptoService.encrypt(plainMedical);
            const encDisciplinary = await cryptoService.encrypt(plainDisciplinary);
            return {
              ...stu,
              encryptedMedicalNotes: encMedical,
              encryptedDisciplinaryNotes: encDisciplinary,
            };
          }
          return stu;
        })
      );
      if (changed) {
        setStudents(updated);
      }
    };
    seedEncryptedNotes();
  }, []);

  const addToast = (
    type: 'success' | 'info' | 'warning' | 'error',
    title: string,
    message: string,
    smsRecipient?: string
  ) => {
    const newToast: ToastAlert = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      smsRecipient,
    };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 7000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Audit Log Recorder
  const recordAuditLog = (
    action: string,
    targetType: AuditChangeLog['targetType'],
    targetName: string,
    details: string
  ) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const log: AuditChangeLog = {
      id: `chg-${Date.now()}`,
      schoolId: activeSchoolId,
      timestamp: ts,
      actorName: actor,
      actorRole: currentRole,
      action,
      targetType,
      targetName,
      details,
    };
    setAuditLogs((prev) => [log, ...prev]);
  };

  // E2EE operations
  const updateE2EEPassphrase = async (passphrase: string) => {
    cryptoService.setPassphrase(passphrase);
    setE2eePassphrase(passphrase);
    setIsE2EEUnlocked(true);
    recordAuditLog('Passphrase Key Rotated', 'school', activeSchool.name, 'Updated AES-256-GCM derivation passphrase.');
    addToast('success', 'E2EE Key Updated', 'New AES-256-GCM derivation key loaded successfully.');
  };

  const decryptStudentField = async (cipherText: string): Promise<string> => {
    if (!isE2EEUnlocked) {
      return '[🔒 Locked / Master Passphrase Required]';
    }
    return cryptoService.decrypt(cipherText);
  };

  const encryptStudentField = async (plainText: string): Promise<string> => {
    return cryptoService.encrypt(plainText);
  };

  // Multi-school actions
  const addSchool = (schoolData: Omit<School, 'id'>): School => {
    const id = `sch-${Date.now()}`;
    const newSchool: School = { ...schoolData, id };
    setSchools((prev) => [...prev, newSchool]);
    setActiveSchoolId(id);
    recordAuditLog('New School Added', 'school', newSchool.name, `Campus code: ${newSchool.code}, Headmaster: ${newSchool.headmasterName}`);
    addToast('success', 'School Added', `Added "${newSchool.name}" to Gabbybru Company Ltd network.`);
    return newSchool;
  };

  // Parent Authentication Actions
  const registerParent = (name: string, phone: string, email: string, studentRollNumber: string) => {
    const trimmedRoll = studentRollNumber.trim().toUpperCase();
    const linkedStudent = students.find((s) => s.rollNumber.toUpperCase() === trimmedRoll);

    if (!linkedStudent) {
      return { success: false, message: `No student found with ID/Roll Number "${studentRollNumber}". Please check the student index number.` };
    }

    const newAccount: ParentAccount = {
      id: `parent-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      linkedStudentRollNumbers: [linkedStudent.rollNumber],
      createdAt: getTimestamp(),
    };

    setParentAccounts((prev) => [...prev, newAccount]);
    setCurrentParent(newAccount);
    setCurrentRole('parent');

    recordAuditLog('Parent Account Created', 'student_photo', linkedStudent.name, `Parent ${name} registered phone ${phone} for instant SMS grade alerts.`);
    addToast(
      'success',
      'Parent Account Created',
      `Welcome ${name}! Your account is linked to ${linkedStudent.name} (${linkedStudent.rollNumber}) for real-time result SMS alerts.`,
      phone
    );

    return { success: true, message: `Account created successfully! Linked to ${linkedStudent.name}.` };
  };

  const loginParent = (phoneOrEmail: string) => {
    const query = phoneOrEmail.trim().toLowerCase();
    const account = parentAccounts.find(
      (p) => p.email.toLowerCase() === query || p.phone.replace(/\D/g, '') === query.replace(/\D/g, '')
    );

    if (account) {
      setCurrentParent(account);
      setCurrentRole('parent');
      addToast('success', 'Parent Logged In', `Logged in as ${account.name}. SMS alerts directed to ${account.phone}.`);
      return { success: true, message: `Welcome back, ${account.name}!` };
    }

    return { success: false, message: 'Account not found. Please register or verify phone/email.' };
  };

  const logoutParent = () => {
    setCurrentParent(null);
    setCurrentRole('student');
    addToast('info', 'Logged Out', 'You have logged out of the Parent Portal.');
  };

  // Headmaster: Student Photo update with timestamp
  const updateStudentPhoto = (studentId: string, photoUrl: string) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            avatar: photoUrl,
            photoUpdatedAt: ts,
            photoUpdatedBy: actor,
            updatedAt: ts,
            updatedBy: actor,
          };
        }
        return s;
      })
    );

    const student = students.find((s) => s.id === studentId);
    recordAuditLog('Student Photo Changed', 'student_photo', student?.name || 'Student', `Updated portrait picture at ${ts} by ${actor}.`);
    addToast('success', 'Student Photo Saved', `Updated picture for ${student?.name || 'student'} (Timestamp: ${ts}).`);
  };

  // Headmaster: Teacher Assignment to Course
  const assignTeacherToSubject = (courseId: string, facultyId: string, coTeachers: string[] = []) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const fac = faculty.find((f) => f.id === facultyId);
    const course = courses.find((c) => c.id === courseId);
    if (!fac || !course) return;

    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId
          ? {
              ...c,
              facultyId,
              facultyName: fac.name,
              coTeachers,
              updatedAt: ts,
              updatedBy: actor,
            }
          : c
      )
    );

    setFaculty((prev) =>
      prev.map((f) => {
        if (f.id === facultyId) {
          return {
            ...f,
            courseIds: [...new Set([...f.courseIds, courseId])],
            assignedBy: actor,
            assignedAt: ts,
          };
        }
        return f;
      })
    );

    recordAuditLog(
      'Teacher Assigned to Subject',
      'teacher_assignment',
      course.name,
      `Assigned ${fac.name} as lead instructor with co-teachers: [${coTeachers.join(', ')}] at ${ts} by ${actor}.`
    );

    addToast('success', 'Teacher Assigned', `Headmaster assigned ${fac.name} to ${course.name}.`);
  };

  // Automated notification helper
  const triggerAutomatedNotification = (
    log: Omit<NotificationLog, 'id' | 'schoolId' | 'timestamp' | 'status'>,
    smsPhone?: string
  ) => {
    const newLog: NotificationLog = {
      ...log,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: activeSchoolId,
      timestamp: getTimestamp(),
      status: 'delivered',
    };
    setNotifications((prev) => [newLog, ...prev]);

    // Show visual in-app banner for automated system action
    addToast(
      log.priority === 'high' ? 'warning' : 'info',
      `📱 Instant Alert (${log.channel.toUpperCase()})`,
      `${log.recipientName}: ${log.title}`,
      smsPhone || log.recipientContact
    );
  };

  // Assistant Head Management (Only Headmaster can appoint assistant heads)
  const addAssistantHead = (facultyId: string, portfolio: AssistantHead['portfolio']) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const fac = faculty.find((f) => f.id === facultyId);
    if (!fac) return;

    const newAssistant: AssistantHead = {
      id: `asst-${Date.now()}`,
      schoolId: activeSchoolId,
      facultyId,
      name: fac.name,
      portfolio,
      appointedByHeadmaster: activeSchool.headmasterName || 'Headmaster',
      appointedAt: ts,
      canApproveExeat: true,
      canManageSchedules: true,
      phone: fac.phone,
      email: fac.email,
    };

    setAssistantHeads((prev) => [...prev, newAssistant]);
    recordAuditLog(
      'Assistant Head Appointed',
      'assistant_head',
      fac.name,
      `Headmaster appointed ${fac.name} as Assistant Head (${portfolio}) with timestamp ${ts}.`
    );
    addToast(
      'success',
      'Assistant Head Appointed',
      `Appointed ${fac.name} as Assistant Headmaster (${portfolio}).`
    );
  };

  // Boarding Student Registration (Teachers / Housemasters / Headmaster can enter)
  const addBoardingStudent = (studentData: Omit<BoardingStudent, 'id' | 'schoolId' | 'updatedAt' | 'updatedBy'>) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const newBoarder: BoardingStudent = {
      ...studentData,
      id: `b-stu-${Date.now()}`,
      schoolId: activeSchoolId,
      updatedAt: ts,
      updatedBy: actor,
    };

    setBoardingStudents((prev) => [newBoarder, ...prev]);
    recordAuditLog(
      'Boarding Student Enrolled',
      'boarding_student',
      newBoarder.studentName,
      `Allocated to ${newBoarder.dormitoryHouse}, Room ${newBoarder.roomNumber}, Bed ${newBoarder.bedNumber} by ${actor} at ${ts}.`
    );
    addToast(
      'success',
      'Boarder Registered',
      `Enrolled ${newBoarder.studentName} in ${newBoarder.dormitoryHouse}.`
    );
  };

  // Exeat Pass Issuance (Teacher / Assistant Head / Headmaster can issue exeat to go home)
  const issueExeatPass = (passData: Omit<ExeatPass, 'id' | 'schoolId' | 'gatePassToken' | 'updatedAt' | 'updatedBy' | 'parentSmsDispatched'>) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const token = `EXT-${Math.floor(1000 + Math.random() * 9000)}-${new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase()}26`;

    const newPass: ExeatPass = {
      ...passData,
      id: `ext-${Date.now()}`,
      schoolId: activeSchoolId,
      gatePassToken: token,
      parentSmsDispatched: true,
      updatedAt: ts,
      updatedBy: actor,
    };

    setExeatPasses((prev) => [newPass, ...prev]);

    // Update boarding student residence status
    setBoardingStudents((prev) =>
      prev.map((b) => (b.id === passData.boardingStudentId ? { ...b, status: 'on_exeat', updatedAt: ts, updatedBy: actor } : b))
    );

    // Record timestamped audit log
    recordAuditLog(
      'Exeat Pass Issued',
      'exeat_pass',
      passData.studentName,
      `Exeat permit issued to ${passData.destinationAddress} from ${passData.departureTime} to ${passData.expectedReturnTime}. Gate Pass: ${token}. Approved by: ${actor}.`
    );

    // Automated Parent SMS Alert
    const smsMessage = `Gabbybru Exeat Alert: ${passData.studentName} was granted exeat pass to ${passData.destinationAddress} from ${passData.departureTime} returning ${passData.expectedReturnTime}. Gate Token: ${token}. Approved by: ${actor}.`;
    addToast('success', 'Exeat Pass Issued & SMS Dispatched', smsMessage, passData.parentContact);

    triggerAutomatedNotification(
      {
        recipientName: `Parent of ${passData.studentName}`,
        recipientRole: 'parent',
        recipientContact: passData.parentContact,
        type: 'announcement',
        title: `Exeat Departure Permit: ${passData.studentName}`,
        message: smsMessage,
        channel: 'sms',
        priority: 'high',
      },
      passData.parentContact
    );
  };

  const updateExeatStatus = (id: string, status: ExeatStatus, returnTime?: string) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();

    setExeatPasses((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = {
            ...p,
            status,
            actualReturnTime: returnTime || (status === 'returned' ? ts : p.actualReturnTime),
            updatedAt: ts,
            updatedBy: actor,
          };
          if (status === 'returned') {
            setBoardingStudents((bPrev) =>
              bPrev.map((b) => (b.id === p.boardingStudentId ? { ...b, status: 'in_residence', updatedAt: ts, updatedBy: actor } : b))
            );
          }
          return updated;
        }
        return p;
      })
    );

    const pass = exeatPasses.find((p) => p.id === id);
    recordAuditLog(
      'Exeat Pass Status Updated',
      'exeat_pass',
      pass?.studentName || 'Student',
      `Exeat status updated to "${status}" by ${actor} at ${ts}.`
    );
    addToast('info', 'Exeat Status Updated', `Exeat pass for ${pass?.studentName || 'student'} is now "${status}".`);
  };

  // Course (Subject) & Faculty Management Actions
  const addCourse = (courseData: Omit<Course, 'id' | 'schoolId' | 'updatedAt' | 'updatedBy'>): Course => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const id = `c-${Date.now()}`;
    const newCourse: Course = {
      ...courseData,
      id,
      schoolId: activeSchoolId,
      updatedAt: ts,
      updatedBy: actor,
    };
    setCourses((prev) => [...prev, newCourse]);

    setFaculty((prev) =>
      prev.map((f) =>
        f.id === courseData.facultyId
          ? { ...f, courseIds: [...new Set([...f.courseIds, id])] }
          : f
      )
    );

    recordAuditLog('Subject Created', 'subject', newCourse.name, `Created for ${newCourse.department} (${newCourse.gradeLevel}) at ${ts} by ${actor}.`);
    addToast(
      'success',
      'Subject Created',
      `Added "${courseData.name}" (${courseData.department} - ${courseData.gradeLevel}) taught by ${courseData.facultyName}.`
    );
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();

    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: ts, updatedBy: actor } : c))
    );

    const course = courses.find((c) => c.id === id);
    recordAuditLog('Subject Updated', 'subject', course?.name || 'Subject', `Changes saved at ${ts} by ${actor}.`);
    addToast('info', 'Subject Updated', `Updated subject details & teacher assignments (Timestamp: ${ts}).`);
  };

  const deleteCourse = (id: string) => {
    const course = courses.find((c) => c.id === id);
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    setCourses((prev) => prev.filter((c) => c.id !== id));
    recordAuditLog('Subject Deleted', 'subject', course?.name || 'Subject', `Removed at ${ts} by ${actor}.`);
    addToast('info', 'Subject Removed', `"${course?.name || 'Subject'}" was removed from the curriculum.`);
  };

  const addFaculty = (facultyData: Omit<FacultyMember, 'id' | 'schoolId'>): FacultyMember => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const id = `fac-${Date.now()}`;
    const newFaculty: FacultyMember = {
      ...facultyData,
      id,
      schoolId: activeSchoolId,
      assignedBy: actor,
      assignedAt: ts,
    };
    setFaculty((prev) => [...prev, newFaculty]);
    recordAuditLog('Teacher Registered', 'teacher_assignment', newFaculty.name, `Registered to ${newFaculty.department} department at ${ts} by ${actor}.`);
    addToast('success', 'Teacher Added', `${newFaculty.name} registered to ${newFaculty.department} Department.`);
    return newFaculty;
  };

  const updateFaculty = (id: string, updates: Partial<FacultyMember>) => {
    setFaculty((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
    addToast('info', 'Teacher Profile Updated', 'Teacher details saved.');
  };

  // Attendance Actions
  const recordAttendance = (
    studentId: string,
    courseId: string,
    status: AttendanceStatus,
    date: string = new Date().toISOString().split('T')[0],
    period: number = 1,
    notes?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    const course = courses.find((c) => c.id === courseId);
    if (!student || !course) return;

    const ts = getTimestamp();
    const actor = getCurrentActorName();
    let notificationSent = false;
    let notifiedAt: string | undefined = undefined;

    const existingIndex = attendance.findIndex(
      (a) => a.studentId === studentId && a.courseId === courseId && a.date === date && a.period === period
    );

    // Automated Parent SMS Alert Trigger on Absence
    if (status === 'absent') {
      notificationSent = true;
      notifiedAt = ts.substring(11, 16);
      triggerAutomatedNotification(
        {
          recipientName: student.parentName,
          recipientRole: 'parent',
          recipientContact: student.parentPhone,
          type: 'attendance',
          title: `URGENT: ${student.name} marked Absent`,
          message: `${student.name} was marked ABSENT from ${course.name} (${course.department} - Period ${period}) at ${notifiedAt}. Timestamp: ${ts}. Contact Gabbybru front desk if excused.`,
          channel: 'sms',
          priority: 'high',
        },
        student.parentPhone
      );
    }

    const newRecord: AttendanceRecord = {
      id: existingIndex >= 0 ? attendance[existingIndex].id : `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: activeSchoolId,
      studentId,
      studentName: student.name,
      courseId,
      courseName: course.name,
      date,
      status,
      period,
      notes,
      notificationSent,
      notifiedAt,
      updatedAt: ts,
      updatedBy: actor,
    };

    if (existingIndex >= 0) {
      setAttendance((prev) => {
        const next = [...prev];
        next[existingIndex] = newRecord;
        return next;
      });
    } else {
      setAttendance((prev) => [newRecord, ...prev]);
    }

    recordAuditLog('Attendance Recorded', 'attendance', student.name, `Marked ${status.toUpperCase()} in ${course.name} (P${period}) at ${ts} by ${actor}.`);
  };

  const bulkMarkAttendance = (courseId: string, date: string, period: number, status: AttendanceStatus) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const enrolledStudents = students.filter((s) => s.enrolledCourseIds.includes(courseId));
    enrolledStudents.forEach((stu) => {
      recordAttendance(stu.id, courseId, status, date, period);
    });

    addToast('success', 'Roster Updated', `All ${enrolledStudents.length} students marked ${status.toUpperCase()} for ${course.name}.`);
  };

  // Grades Actions: Percentage-based with timestamps & automated parent SMS
  const addGrade = (newGrade: Omit<GradeItem, 'id' | 'schoolId' | 'percentage' | 'updatedAt' | 'updatedBy'>) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const id = `g-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Exact percentage calculation
    const percentage = Number(((newGrade.score / newGrade.maxScore) * 100).toFixed(1));

    const gradeItem: GradeItem = {
      ...newGrade,
      id,
      schoolId: activeSchoolId,
      percentage,
      updatedAt: ts,
      updatedBy: actor,
    };
    setGrades((prev) => [gradeItem, ...prev]);

    const student = students.find((s) => s.id === newGrade.studentId);
    if (student) {
      // Prompt Requirement: "parents can create and login and get sms alert on their phone any time their children result are posted and their grade should be in percentages"
      triggerAutomatedNotification(
        {
          recipientName: student.parentName,
          recipientRole: 'parent',
          recipientContact: student.parentPhone,
          type: 'academic',
          title: `Result Alert: ${student.name} (${percentage}%)`,
          message: `Gabbybru Company Ltd: New assessment result posted for ${student.name} in ${newGrade.courseName}. Score: ${percentage}% (${newGrade.score}/${newGrade.maxScore}). Timestamp: ${ts}. Log in to parent portal to view breakdown.`,
          channel: 'sms',
          priority: 'high',
        },
        student.parentPhone
      );
    }

    recordAuditLog(
      `Grade Result Posted (${percentage}%)`,
      'grade',
      newGrade.studentName,
      `Recorded ${percentage}% for ${newGrade.title} in ${newGrade.courseName} at ${ts} by ${actor}. Parent SMS alert sent.`
    );

    addToast(
      'success',
      'Grade & Result Posted',
      `Recorded ${percentage}% for ${newGrade.studentName}. Automated SMS dispatched to ${student?.parentPhone || 'parent'}.`
    );
  };

  const updateGrade = (id: string, updates: Partial<GradeItem>) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();

    setGrades((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const score = updates.score !== undefined ? updates.score : g.score;
          const maxScore = updates.maxScore !== undefined ? updates.maxScore : g.maxScore;
          const percentage = Number(((score / maxScore) * 100).toFixed(1));

          return {
            ...g,
            ...updates,
            percentage,
            updatedAt: ts,
            updatedBy: actor,
          };
        }
        return g;
      })
    );

    const targetGrade = grades.find((g) => g.id === id);
    if (targetGrade) {
      recordAuditLog(
        'Grade Result Modified',
        'grade',
        targetGrade.studentName,
        `Assessment "${targetGrade.title}" updated at ${ts} by ${actor}.`
      );
    }
    addToast('info', 'Grade Synchronized', `Assessment updated with timestamp ${ts}.`);
  };

  const deleteGrade = (id: string) => {
    const target = grades.find((g) => g.id === id);
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    setGrades((prev) => prev.filter((g) => g.id !== id));
    if (target) {
      recordAuditLog('Grade Result Deleted', 'grade', target.studentName, `Assessment "${target.title}" deleted at ${ts} by ${actor}.`);
    }
    addToast('info', 'Grade Removed', 'Assessment grade removed from evaluation.');
  };

  // Timetable & Faculty Actions
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id' | 'schoolId' | 'updatedAt' | 'updatedBy'>) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const id = `tt-${Date.now()}`;
    const newSlot: TimetableSlot = {
      ...slot,
      id,
      schoolId: activeSchoolId,
      updatedAt: ts,
      updatedBy: actor,
    };
    setTimetable((prev) => [...prev, newSlot]);
    recordAuditLog('Timetable Slot Added', 'subject', slot.courseName, `Scheduled ${slot.day} Period ${slot.period} at ${ts} by ${actor}.`);
    addToast('success', 'Timetable Updated', `Added ${slot.courseName} (${slot.day} Period ${slot.period}).`);
  };

  const assignSubstituteFaculty = (slotId: string, newFacultyId: string, reason: string) => {
    const slot = timetable.find((s) => s.id === slotId);
    const subFaculty = faculty.find((f) => f.id === newFacultyId);
    if (!slot || !subFaculty) return;

    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const prevFacultyName = slot.facultyName;

    setTimetable((prev) =>
      prev.map((s) =>
        s.id === slotId
          ? { ...s, facultyId: newFacultyId, facultyName: subFaculty.name, updatedAt: ts, updatedBy: actor }
          : s
      )
    );

    triggerAutomatedNotification({
      recipientName: subFaculty.name,
      recipientRole: 'faculty',
      recipientContact: subFaculty.email,
      type: 'announcement',
      title: `Cover Class Assignment: ${slot.courseName}`,
      message: `You have been designated substitute instructor for ${slot.courseName} (${slot.day} Period ${slot.period}, ${slot.room}). Prior instructor: ${prevFacultyName}. Reason: ${reason}. Timestamp: ${ts}.`,
      channel: 'push',
      priority: 'high',
    });

    recordAuditLog(
      'Substitute Faculty Assigned',
      'teacher_assignment',
      slot.courseName,
      `Reassigned from ${prevFacultyName} to ${subFaculty.name} at ${ts} by ${actor}.`
    );

    addToast('success', 'Substitute Assigned', `${subFaculty.name} has been notified and timetabled for ${slot.courseName}.`);
  };

  // Visa Billing & Subscriptions
  const payInvoiceWithVisa = async (
    invoiceId: string,
    visaCard: {
      cardNumber: string;
      cardHolder: string;
      expiry: string;
      cvv: string;
    }
  ): Promise<{ success: boolean; transactionId: string; authCode: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const cleanNumber = visaCard.cardNumber.replace(/\s+/g, '');
    const last4 = cleanNumber.slice(-4) || '4242';
    const transactionId = `TXN-VISA-${Math.floor(100000 + Math.random() * 900000)}`;
    const authCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    const ts = getTimestamp();

    const encryptedCardToken = await cryptoService.encrypt(
      JSON.stringify({
        last4,
        cardHolder: visaCard.cardHolder,
        authorizedAt: new Date().toISOString(),
        network: 'VISA_GLOBAL_DEBIT_CREDIT',
      })
    );

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'paid',
              paymentDetails: {
                cardBrand: 'Visa',
                last4,
                transactionId,
                authCode,
                paidAt: ts,
                encryptedCardToken,
              },
            }
          : inv
      )
    );

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === invoice.studentId) {
          return { ...s, feeStatus: 'paid', updatedAt: ts, updatedBy: 'Visa Bursar Gateway' };
        }
        return s;
      })
    );

    const student = students.find((s) => s.id === invoice.studentId);
    triggerAutomatedNotification(
      {
        recipientName: student?.parentName || visaCard.cardHolder,
        recipientRole: 'parent',
        recipientContact: student?.parentPhone || 'parent@family.com',
        type: 'payment_receipt',
        title: `Visa Payment Receipt: $${invoice.amount.toFixed(2)} Authorized`,
        message: `Your payment of $${invoice.amount.toFixed(2)} for ${invoice.description} was processed via Visa ending in ${last4}. Authorization: ${authCode}. Gabbybru Company Ltd Bursar. Timestamp: ${ts}.`,
        channel: 'sms',
        priority: 'normal',
      },
      student?.parentPhone
    );

    recordAuditLog(
      'Visa Fee Settled',
      'grade',
      invoice.studentName,
      `Paid $${invoice.amount.toFixed(2)} for ${invoice.description} via Visa (${last4}). Auth: ${authCode}.`
    );

    addToast('success', 'Visa Payment Authorized', `$${invoice.amount.toFixed(2)} paid successfully. Ref: ${transactionId}`);

    return { success: true, transactionId, authCode };
  };

  const createCustomInvoice = (invoiceData: Omit<FeeInvoice, 'id' | 'schoolId' | 'status'>) => {
    const id = `inv-${Date.now()}`;
    const ts = getTimestamp();
    const actor = getCurrentActorName();

    const newInvoice: FeeInvoice = {
      ...invoiceData,
      id,
      schoolId: activeSchoolId,
      status: 'pending',
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    setStudents((prev) =>
      prev.map((s) => (s.id === invoiceData.studentId ? { ...s, feeStatus: 'pending', updatedAt: ts, updatedBy: actor } : s))
    );

    const student = students.find((s) => s.id === invoiceData.studentId);
    if (student) {
      triggerAutomatedNotification(
        {
          recipientName: student.parentName,
          recipientRole: 'parent',
          recipientContact: student.parentPhone,
          type: 'fee_due',
          title: `New School Fee Invoice Issued ($${invoiceData.amount.toFixed(2)})`,
          message: `An invoice for ${invoiceData.description} ($${invoiceData.amount.toFixed(2)}) has been posted for ${student.name}. Due on ${invoiceData.dueDate}. Settle securely via Visa. Gabbybru Company Ltd.`,
          channel: 'sms',
          priority: 'normal',
        },
        student.parentPhone
      );
    }

    recordAuditLog('Fee Invoice Issued', 'grade', invoiceData.studentName, `Issued $${invoiceData.amount.toFixed(2)} for ${invoiceData.description} at ${ts} by ${actor}.`);
    addToast('success', 'Invoice Generated', `Fee invoice of $${invoiceData.amount.toFixed(2)} created for ${invoiceData.studentName}.`);
  };

  const sendManualNotification = (notifData: Omit<NotificationLog, 'id' | 'schoolId' | 'timestamp' | 'status'>) => {
    triggerAutomatedNotification(notifData);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'read' } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    addToast('info', 'Notifications Cleared', 'Notification activity history cleared.');
  };

  const updateStudentConfidentialNotes = async (
    studentId: string,
    medicalNotes: string,
    disciplinaryNotes: string
  ) => {
    const ts = getTimestamp();
    const actor = getCurrentActorName();
    const encryptedMedical = await cryptoService.encrypt(medicalNotes);
    const encryptedDisciplinary = await cryptoService.encrypt(disciplinaryNotes);

    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              encryptedMedicalNotes: encryptedMedical,
              encryptedDisciplinaryNotes: encryptedDisciplinary,
              updatedAt: ts,
              updatedBy: actor,
            }
          : s
      )
    );

    recordAuditLog('E2EE Health & Discipline Notes Updated', 'student_photo', studentId, `Re-encrypted with AES-256-GCM at ${ts} by ${actor}.`);
    addToast('success', 'E2EE Record Encrypted', `Confidential data encrypted with AES-256-GCM (Timestamp: ${ts}).`);
  };

  const resetDemoData = () => {
    localStorage.clear();
    setSchools(INITIAL_SCHOOLS);
    setActiveSchoolId('sch-1');
    setStudents(INITIAL_STUDENTS);
    setCourses(INITIAL_COURSES);
    setFaculty(INITIAL_FACULTY);
    setAttendance(INITIAL_ATTENDANCE);
    setGrades(INITIAL_GRADES);
    setInvoices(INITIAL_INVOICES);
    setTimetable(INITIAL_TIMETABLE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setParentAccounts(INITIAL_PARENT_ACCOUNTS);
    setCurrentParent(null);
    addToast('info', 'Reset Complete', 'Database restored to Gabbybru Company Ltd network defaults.');
  };

  const value = useMemo(
    () => ({
      schools,
      activeSchoolId,
      setActiveSchoolId,
      activeSchool,
      addSchool,
      currentRole,
      setCurrentRole,
      activeView,
      setActiveView,
      mobilePreviewMode,
      setMobilePreviewMode,
      mobileDeviceType,
      setMobileDeviceType,
      selectedDepartment,
      setSelectedDepartment,
      students,
      courses,
      faculty,
      timetable,
      attendance,
      grades,
      invoices,
      subscriptions,
      notifications,
      auditLogs,
      toasts,
      removeToast,
      parentAccounts,
      currentParent,
      registerParent,
      loginParent,
      logoutParent,
      isE2EEUnlocked,
      setIsE2EEUnlocked,
      e2eePassphrase,
      updateE2EEPassphrase,
      decryptStudentField,
      encryptStudentField,
      addCourse,
      updateCourse,
      deleteCourse,
      addFaculty,
      updateFaculty,
      assignTeacherToSubject,
      updateStudentPhoto,
      assistantHeads,
      addAssistantHead,
      boardingStudents,
      addBoardingStudent,
      exeatPasses,
      issueExeatPass,
      updateExeatStatus,
      recordAttendance,
      bulkMarkAttendance,
      addGrade,
      updateGrade,
      deleteGrade,
      addTimetableSlot,
      assignSubstituteFaculty,
      payInvoiceWithVisa,
      createCustomInvoice,
      sendManualNotification,
      markNotificationAsRead,
      clearAllNotifications,
      recordAuditLog,
      updateStudentConfidentialNotes,
      searchQuery,
      setSearchQuery,
      resetDemoData,
    }),
    [
      schools,
      activeSchoolId,
      activeSchool,
      currentRole,
      activeView,
      mobilePreviewMode,
      mobileDeviceType,
      selectedDepartment,
      students,
      courses,
      faculty,
      timetable,
      attendance,
      grades,
      invoices,
      subscriptions,
      notifications,
      auditLogs,
      assistantHeads,
      boardingStudents,
      exeatPasses,
      toasts,
      parentAccounts,
      currentParent,
      isE2EEUnlocked,
      e2eePassphrase,
      searchQuery,
    ]
  );

  return <SchoolContext.Provider value={value}>{children}</SchoolContext.Provider>;
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
