export type Role = 'owner' | 'captain' | 'boy';

export type BoyCategory = 'A' | 'B' | 'C';

export type AccountStatus = 'pending' | 'active' | 'rejected' | 'deactivated';

export interface UserProfile {
  uid: string;
  role: Role;
  fullName: string;
  mobileNumber: string;
  photoPath?: string;
  photoUrl?: string;
  DOB: string;
  exactPlace: string;
  postOffice: string;
  district: string;
  bloodGroup: string;
  currentCategory?: BoyCategory | null;
  currentOfficialId: string;
  accountStatus: AccountStatus;
  approvedAt?: string;
  approvedBy?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  rejectionReason?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  fullName: string;
  mobileNumber: string;
  photoPath?: string;
  photoUrl?: string;
  DOB: string;
  exactPlace: string;
  postOffice: string;
  district: string;
  bloodGroup: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type WorkStatus = 'draft' | 'available' | 'full' | 'finished' | 'cancelled';

export interface Work {
  id: string;
  name: string;
  workDate: string; // YYYY-MM-DD
  reportingTime: string; // HH:mm
  sitePlace: string;
  description: string;
  instructions: string;
  pax: number;
  status: WorkStatus;
  mainSiteCaptainId: string;
  mainSiteCaptainName: string;
  mainSiteCaptainOfficialId: string;
  aRequired: number;
  bRequired: number;
  cRequired: number;
  totalRequired: number;
  aFilled: number;
  bFilled: number;
  cFilled: number;
  totalFilled: number;
  createdMetadata?: { at: string; by: string };
  confirmedMetadata?: { at: string; by: string };
  finishedMetadata?: { at: string; by: string };
  cancelledMetadata?: { at: string; by: string; reason?: string };
  createdAt: string;
  updatedAt: string;
}

export interface WorkPublic {
  id: string;
  name: string;
  workDate: string;
  reportingTime: string;
  sitePlace: string;
  description: string;
  instructions: string;
  pax: number;
  status: 'available' | 'full' | 'finished' | 'cancelled';
  isAvailable: boolean;
  mainSiteCaptainName: string;
  mainSiteCaptainOfficialId: string;
  updatedAt: string;
}

export type MembershipStatus = 'active' | 'left' | 'removed';

export interface WorkMember {
  id: string; // workId_userId
  workId: string;
  userId: string;
  membershipStatus: MembershipStatus;
  joinedAt: string;
  joinedBy: string;
  leftAt?: string;
  removedAt?: string;
  readdedAt?: string;
  ownerOverride?: boolean;
  snapshotName: string;
  snapshotBoyId: string;
  snapshotCategory: BoyCategory;
  snapshotBaseWage: number;
}

export interface WorkCaptain {
  id: string; // workId_captainId
  workId: string;
  captainId: string;
  isMain: boolean;
  active: boolean;
  snapshotName: string;
  snapshotOfficialId: string;
  assignedAt: string;
  removedAt?: string;
}

export type AttendanceStatus = 'unmarked' | 'present';

export interface WorkAttendance {
  id: string; // workId_boyId
  workId: string;
  boyId: string;
  workMemberId: string;
  status: AttendanceStatus;
  markedAt?: string;
  markedBy?: string;
  updatedAt: string;
}

export interface WorkWage {
  id: string; // workId_boyId
  workId: string;
  boyId: string;
  memberId: string;
  categorySnapshot: BoyCategory;
  baseWage: number;
  draftAdjustment: number;
  draftTotal: number;
  publishedBase?: number;
  publishedAdjustment?: number;
  publishedTotal?: number;
  publishedVersion: number;
  publishedAt?: string;
  publishedBy?: string;
  isPublished: boolean;
}

export interface UserWageView {
  workId: string;
  workName: string;
  workDate: string;
  categorySnapshot: BoyCategory;
  publishedBase: number;
  publishedAdjustment: number;
  publishedTotal: number;
  publishedVersion: number;
  publishedAt: string;
  billerName?: string;
  billerOfficialId?: string;
  paymentStatus: 'unpaid' | 'paid';
  paidAt?: string;
}

export interface WorkBiller {
  id: string; // workId_boyId
  workId: string;
  boyId: string;
  captainId: string;
  billerName: string;
  billerOfficialId: string;
  assignedAt: string;
  assignedBy: string;
}

export type PaymentStatus = 'unpaid' | 'paid';

export interface WorkPayment {
  id: string; // workId_boyId
  workId: string;
  boyId: string;
  billerId: string;
  billerName: string;
  wageRef?: string;
  wageVersion?: number;
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
  lastChangedAt: string;
  lastChangedBy: string;
}

export interface PaymentEvent {
  id: string;
  workId: string;
  boyId: string;
  billerId: string;
  actorId: string;
  actorNameSnapshot: string;
  previousStatus: PaymentStatus;
  newStatus: PaymentStatus;
  amount: number;
  timestamp: string;
}

export interface CaptainWage {
  id: string;
  workId: string;
  workName: string;
  workDate: string;
  captainId: string;
  captainName: string;
  captainOfficialId: string;
  wageAmount: number;
  status: PaymentStatus;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'work' | 'wage' | 'payment' | 'application' | 'system';
  targetUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  createdAt: string;
  actorId: string;
  actorNameSnapshot: string;
  actorOfficialIdSnapshot: string;
  actionType: string;
  workId?: string | null;
  affectedUserId?: string | null;
  oldValue?: any;
  newValue?: any;
  metadata?: Record<string, any>;
}

export interface WageSettings {
  categoryA: number;
  categoryB: number;
  categoryC: number;
  updatedAt: string;
  updatedBy: string;
}

export interface SystemSettings {
  allowOvernightLeave: boolean;
  autoNotifyWorkers: boolean;
  maintenanceMode: boolean;
  updatedAt: string;
}
