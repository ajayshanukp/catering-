import { 
  UserProfile, 
  Application, 
  Work, 
  WorkPublic, 
  WorkMember, 
  WorkCaptain, 
  WorkAttendance, 
  WorkWage, 
  UserWageView, 
  WorkBiller, 
  WorkPayment, 
  PaymentEvent, 
  CaptainWage, 
  NotificationItem, 
  AuditLog, 
  WageSettings, 
  SystemSettings,
  BoyCategory,
  AttendanceStatus,
  PaymentStatus,
  Role
} from '../types';
import { generateOfficialBoyId, updateBoyIdCategory, generateOfficialCaptainId } from '../lib/idGenerator';
import { AppError } from '../lib/errorCodes';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Local storage keys for persistent offline/development data fallback
const STORAGE_PREFIX = 'cwm_data_';

class WorkforceService {
  private listeners: Set<() => void> = new Set();

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Storage read error for', key, e);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      this.notify();
    } catch (e) {
      console.warn('Storage write error for', key, e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  // Initial Seed for standard wage settings
  public getWageSettings(): WageSettings {
    return this.getItem<WageSettings>('wage_settings', {
      categoryA: 600,
      categoryB: 500,
      categoryC: 450,
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    });
  }

  public updateWageSettings(settings: Partial<WageSettings>, actor: UserProfile): WageSettings {
    const current = this.getWageSettings();
    const updated: WageSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.fullName,
    };
    this.setItem('wage_settings', updated);
    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'wage_settings_updated',
      oldValue: current,
      newValue: updated,
    });
    return updated;
  }

  public getSystemSettings(): SystemSettings {
    return this.getItem<SystemSettings>('system_settings', {
      allowOvernightLeave: false,
      autoNotifyWorkers: true,
      maintenanceMode: false,
      updatedAt: new Date().toISOString(),
    });
  }

  public updateSystemSettings(settings: Partial<SystemSettings>, actor: UserProfile): SystemSettings {
    const current = this.getSystemSettings();
    const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
    this.setItem('system_settings', updated);
    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'system_settings_updated',
      oldValue: current,
      newValue: updated,
    });
    return updated;
  }

  // --- Users & Profiles ---
  public getUsers(): UserProfile[] {
    return this.getItem<UserProfile[]>('users', []);
  }

  public getUserById(uid: string): UserProfile | undefined {
    return this.getUsers().find(u => u.uid === uid);
  }

  public getUserByOfficialId(officialId: string): UserProfile | undefined {
    const clean = officialId.trim().toUpperCase();
    return this.getUsers().find(u => u.currentOfficialId.toUpperCase() === clean);
  }

  public saveUserProfile(profile: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === profile.uid);
    if (idx >= 0) {
      users[idx] = { ...profile, updatedAt: new Date().toISOString() };
    } else {
      users.push({ ...profile, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.setItem('users', users);
  }

  public changeBoyCategory(boyId: string, newCategory: BoyCategory, actor: UserProfile): UserProfile {
    const user = this.getUserById(boyId);
    if (!user) throw new AppError('UNKNOWN', 'User not found');
    if (user.role !== 'boy') throw new AppError('PERMISSION_DENIED', 'Target is not a Boy');
    if (user.currentCategory === newCategory) return user;

    const oldCategory = user.currentCategory;
    const oldId = user.currentOfficialId;
    const newId = updateBoyIdCategory(oldId, newCategory);

    const updated: UserProfile = {
      ...user,
      currentCategory: newCategory,
      currentOfficialId: newId,
      updatedAt: new Date().toISOString(),
    };
    this.saveUserProfile(updated);

    // Record ID history
    const history = this.getItem<any[]>('user_id_history', []);
    history.push({
      id: `${boyId}_${Date.now()}`,
      userId: boyId,
      previousId: oldId,
      newId: newId,
      previousCategory: oldCategory,
      newCategory: newCategory,
      changedAt: new Date().toISOString(),
      changedBy: actor.fullName,
    });
    this.setItem('user_id_history', history);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'category_changed',
      affectedUserId: boyId,
      oldValue: { category: oldCategory, officialId: oldId },
      newValue: { category: newCategory, officialId: newId },
    });

    this.sendNotification({
      userId: boyId,
      title: 'Category Updated',
      message: `Your category has been updated to Category ${newCategory}. Your new Boy ID is ${newId}.`,
      type: 'system',
    });

    return updated;
  }

  public setUserStatus(uid: string, status: 'active' | 'deactivated', actor: UserProfile): void {
    const user = this.getUserById(uid);
    if (!user) throw new AppError('UNKNOWN', 'User not found');
    const oldStatus = user.accountStatus;
    user.accountStatus = status;
    if (status === 'deactivated') {
      user.deactivatedAt = new Date().toISOString();
      user.deactivatedBy = actor.fullName;
    }
    user.updatedAt = new Date().toISOString();
    this.saveUserProfile(user);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: status === 'deactivated' ? 'account_deactivated' : 'account_reactivated',
      affectedUserId: uid,
      oldValue: oldStatus,
      newValue: status,
    });

    this.sendNotification({
      userId: uid,
      title: status === 'deactivated' ? 'Account Deactivated' : 'Account Reactivated',
      message: status === 'deactivated' 
        ? 'Your account has been deactivated by management. Please contact support.' 
        : 'Your account has been restored to active status.',
      type: 'system',
    });
  }

  // --- Applications ---
  public getApplications(): Application[] {
    return this.getItem<Application[]>('applications', []);
  }

  public getApplicationById(id: string): Application | undefined {
    return this.getApplications().find(a => a.id === id);
  }

  public submitApplication(data: Omit<Application, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Application {
    const applications = this.getApplications();
    const id = `app_${Date.now()}`;
    const newApp: Application = {
      ...data,
      id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    applications.push(newApp);
    this.setItem('applications', applications);

    // Update user profile status
    const user = this.getUserById(data.userId);
    if (user) {
      user.fullName = data.fullName;
      user.DOB = data.DOB;
      user.exactPlace = data.exactPlace;
      user.postOffice = data.postOffice;
      user.district = data.district;
      user.bloodGroup = data.bloodGroup;
      user.photoUrl = data.photoUrl;
      user.accountStatus = 'pending';
      this.saveUserProfile(user);
    }

    this.addAuditLog({
      actorId: data.userId,
      actorNameSnapshot: data.fullName,
      actorOfficialIdSnapshot: 'APPLICANT',
      actionType: 'application_submitted',
      affectedUserId: data.userId,
      newValue: { applicationId: id },
    });

    return newApp;
  }

  public approveApplication(appId: string, actor: UserProfile): void {
    const apps = this.getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new AppError('UNKNOWN', 'Application not found');
    if (app.status !== 'pending') throw new AppError('PERMISSION_DENIED', 'Application is not pending');

    app.status = 'approved';
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = actor.fullName;
    app.updatedAt = new Date().toISOString();
    this.setItem('applications', apps);

    // Determine sequence number for new Boy
    const boys = this.getUsers().filter(u => u.role === 'boy' && u.currentOfficialId.startsWith('BOY-'));
    const nextSeq = 1000 + boys.length + 1;
    const defaultCategory: BoyCategory = 'C';
    const officialId = generateOfficialBoyId(nextSeq, defaultCategory);

    const user = this.getUserById(app.userId);
    if (user) {
      user.role = 'boy';
      user.accountStatus = 'active';
      user.currentCategory = defaultCategory;
      user.currentOfficialId = officialId;
      user.approvedAt = new Date().toISOString();
      user.approvedBy = actor.fullName;
      user.updatedAt = new Date().toISOString();
      this.saveUserProfile(user);
    }

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'application_approved',
      affectedUserId: app.userId,
      newValue: { officialId, category: defaultCategory },
    });

    this.sendNotification({
      userId: app.userId,
      title: 'Application Approved!',
      message: `Welcome to Catering Force! Your application was approved. Your Boy ID is ${officialId} (Category C).`,
      type: 'application',
      targetUrl: '/boy',
    });
  }

  public rejectApplication(appId: string, reason: string, actor: UserProfile): void {
    if (!reason.trim()) throw new AppError('UNKNOWN', 'Rejection reason is required');
    const apps = this.getApplications();
    const app = apps.find(a => a.id === appId);
    if (!app) throw new AppError('UNKNOWN', 'Application not found');

    app.status = 'rejected';
    app.rejectionReason = reason;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = actor.fullName;
    app.updatedAt = new Date().toISOString();
    this.setItem('applications', apps);

    const user = this.getUserById(app.userId);
    if (user) {
      user.accountStatus = 'rejected';
      user.rejectionReason = reason;
      user.updatedAt = new Date().toISOString();
      this.saveUserProfile(user);
    }

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'application_rejected',
      affectedUserId: app.userId,
      newValue: { reason },
    });

    this.sendNotification({
      userId: app.userId,
      title: 'Application Needs Revision',
      message: `Your application could not be approved: ${reason}. Please update and resubmit.`,
      type: 'application',
      targetUrl: '/status',
    });
  }

  // --- Works Management ---
  public getWorks(): Work[] {
    return this.getItem<Work[]>('works', []);
  }

  public getWorkById(workId: string): Work | undefined {
    return this.getWorks().find(w => w.id === workId);
  }

  public getPublicWorks(): WorkPublic[] {
    const works = this.getWorks();
    return works
      .filter(w => w.status !== 'draft')
      .map(w => ({
        id: w.id,
        name: w.name,
        workDate: w.workDate,
        reportingTime: w.reportingTime,
        sitePlace: w.sitePlace,
        description: w.description,
        instructions: w.instructions,
        pax: w.pax,
        status: w.status === 'draft' ? 'available' : w.status,
        isAvailable: w.status === 'available',
        mainSiteCaptainName: w.mainSiteCaptainName,
        mainSiteCaptainOfficialId: w.mainSiteCaptainOfficialId,
        updatedAt: w.updatedAt,
      }));
  }

  public createWork(
    payload: Omit<Work, 'id' | 'aFilled' | 'bFilled' | 'cFilled' | 'totalFilled' | 'createdAt' | 'updatedAt' | 'totalRequired'>,
    actor: UserProfile,
    isConfirmed: boolean = false
  ): Work {
    const works = this.getWorks();
    const id = `work_${Date.now()}`;
    const totalRequired = Number(payload.aRequired || 0) + Number(payload.bRequired || 0) + Number(payload.cRequired || 0);

    const now = new Date().toISOString();
    const newWork: Work = {
      ...payload,
      id,
      totalRequired,
      aFilled: 0,
      bFilled: 0,
      cFilled: 0,
      totalFilled: 0,
      status: isConfirmed ? (totalRequired === 0 ? 'full' : 'available') : 'draft',
      createdMetadata: { at: now, by: actor.fullName },
      confirmedMetadata: isConfirmed ? { at: now, by: actor.fullName } : undefined,
      createdAt: now,
      updatedAt: now,
    };

    works.push(newWork);
    this.setItem('works', works);

    // Register Captain relationship
    if (payload.mainSiteCaptainId) {
      this.assignCaptain(id, payload.mainSiteCaptainId, true, actor);
    }

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'work_created',
      workId: id,
      newValue: { name: newWork.name, status: newWork.status, totalRequired },
    });

    return newWork;
  }

  public updateWork(workId: string, patch: Partial<Work>, actor: UserProfile): Work {
    const works = this.getWorks();
    const idx = works.findIndex(w => w.id === workId);
    if (idx === -1) throw new AppError('WORK_NOT_FOUND');

    const current = works[idx];
    const aReq = patch.aRequired !== undefined ? patch.aRequired : current.aRequired;
    const bReq = patch.bRequired !== undefined ? patch.bRequired : current.bRequired;
    const cReq = patch.cRequired !== undefined ? patch.cRequired : current.cRequired;
    const totalRequired = Number(aReq) + Number(bReq) + Number(cReq);

    const updated: Work = {
      ...current,
      ...patch,
      totalRequired,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate status if not finished or cancelled
    if (updated.status === 'available' || updated.status === 'full') {
      updated.status = updated.totalFilled >= updated.totalRequired ? 'full' : 'available';
    }

    works[idx] = updated;
    this.setItem('works', works);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'work_updated',
      workId,
      oldValue: current,
      newValue: updated,
    });

    return updated;
  }

  public confirmWork(workId: string, actor: UserProfile): Work {
    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');
    if (work.status !== 'draft') return work;

    const status = work.totalFilled >= work.totalRequired ? 'full' : 'available';
    return this.updateWork(workId, {
      status,
      confirmedMetadata: { at: new Date().toISOString(), by: actor.fullName },
    }, actor);
  }

  public finishWork(workId: string, actor: UserProfile): Work {
    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');
    if (work.status === 'cancelled') throw new AppError('PERMISSION_DENIED', 'Cannot finish a cancelled Work');

    const updated = this.updateWork(workId, {
      status: 'finished',
      finishedMetadata: { at: new Date().toISOString(), by: actor.fullName },
    }, actor);

    // Pre-initialize draft wages for all active assigned Boys using base wage snapshot
    const members = this.getWorkMembers(workId).filter(m => m.membershipStatus === 'active');
    members.forEach(m => {
      this.ensureWorkWageDraft(workId, m.userId, m.snapshotCategory, m.snapshotBaseWage);
    });

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'work_finished',
      workId,
    });

    return updated;
  }

  public cancelWork(workId: string, reason: string, actor: UserProfile): Work {
    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');

    const updated = this.updateWork(workId, {
      status: 'cancelled',
      cancelledMetadata: { at: new Date().toISOString(), by: actor.fullName, reason },
    }, actor);

    // Notify all assigned workers and captains
    const members = this.getWorkMembers(workId).filter(m => m.membershipStatus === 'active');
    members.forEach(m => {
      this.sendNotification({
        userId: m.userId,
        title: 'Work Cancelled',
        message: `The Work "${work.name}" scheduled for ${work.workDate} has been cancelled.`,
        type: 'work',
        targetUrl: `/boy/history`,
      });
    });

    const captains = this.getWorkCaptains(workId).filter(c => c.active);
    captains.forEach(c => {
      this.sendNotification({
        userId: c.captainId,
        title: 'Work Cancelled',
        message: `Work "${work.name}" on ${work.workDate} was cancelled by management.`,
        type: 'work',
      });
    });

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'work_cancelled',
      workId,
      newValue: { reason },
    });

    return updated;
  }

  // --- Work Captains ---
  public getWorkCaptains(workId: string): WorkCaptain[] {
    const all = this.getItem<WorkCaptain[]>('work_captains', []);
    return all.filter(wc => wc.workId === workId);
  }

  public assignCaptain(workId: string, captainId: string, isMain: boolean, actor: UserProfile): void {
    const captainUser = this.getUserById(captainId);
    if (!captainUser) throw new AppError('UNKNOWN', 'Captain not found');

    const all = this.getItem<WorkCaptain[]>('work_captains', []);
    const id = `${workId}_${captainId}`;
    const existingIdx = all.findIndex(c => c.id === id);

    if (existingIdx >= 0) {
      all[existingIdx].active = true;
      all[existingIdx].isMain = isMain;
      all[existingIdx].removedAt = undefined;
    } else {
      all.push({
        id,
        workId,
        captainId,
        isMain,
        active: true,
        snapshotName: captainUser.fullName,
        snapshotOfficialId: captainUser.currentOfficialId,
        assignedAt: new Date().toISOString(),
      });
    }

    this.setItem('work_captains', all);

    if (isMain) {
      const work = this.getWorkById(workId);
      if (work) {
        work.mainSiteCaptainId = captainId;
        work.mainSiteCaptainName = captainUser.fullName;
        work.mainSiteCaptainOfficialId = captainUser.currentOfficialId;
        this.updateWork(workId, work, actor);
      }
    }

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'captain_assigned',
      workId,
      affectedUserId: captainId,
      newValue: { isMain },
    });
  }

  public removeCaptain(workId: string, captainId: string, actor: UserProfile): void {
    const all = this.getItem<WorkCaptain[]>('work_captains', []);
    const id = `${workId}_${captainId}`;
    const target = all.find(c => c.id === id);
    if (!target) return;

    if (target.isMain) {
      throw new AppError('PERMISSION_DENIED', 'Cannot remove main Site Captain without assigning a replacement');
    }

    target.active = false;
    target.removedAt = new Date().toISOString();
    this.setItem('work_captains', all);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'captain_removed',
      workId,
      affectedUserId: captainId,
    });
  }

  // --- Staffing & Work Members ---
  public getWorkMembers(workId: string): WorkMember[] {
    const all = this.getItem<WorkMember[]>('work_members', []);
    return all.filter(m => m.workId === workId);
  }

  public getBoyActiveWorks(boyId: string): WorkMember[] {
    const all = this.getItem<WorkMember[]>('work_members', []);
    return all.filter(m => m.userId === boyId && m.membershipStatus === 'active');
  }

  public getAllBoyMemberships(boyId: string): WorkMember[] {
    const all = this.getItem<WorkMember[]>('work_members', []);
    return all.filter(m => m.userId === boyId);
  }


  // ATOMIC / TRANSACTION-CRITICAL TAKE WORK
  public takeWork(workId: string, boy: UserProfile): WorkMember {
    if (boy.role !== 'boy') throw new AppError('PERMISSION_DENIED', 'Only Boys can join Works');
    if (boy.accountStatus !== 'active') throw new AppError('ACCOUNT_INACTIVE');

    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');
    if (work.status === 'draft' || work.status === 'cancelled' || work.status === 'finished') {
      throw new AppError('WORK_NOT_AVAILABLE');
    }
    if (work.status === 'full' || work.totalFilled >= work.totalRequired) {
      throw new AppError('WORK_FULL');
    }

    // Check same-day lock
    const locks = this.getItem<string[]>('daily_locks', []);
    const lockKey = `${boy.uid}_${work.workDate}`;
    if (locks.includes(lockKey)) {
      throw new AppError('DAY_CONFLICT');
    }

    // Check membership
    const members = this.getWorkMembers(workId);
    const existing = members.find(m => m.userId === boy.uid && m.membershipStatus === 'active');
    if (existing) {
      throw new AppError('ALREADY_ASSIGNED');
    }

    // Check category vacancy
    const cat = boy.currentCategory || 'C';
    if (cat === 'A' && work.aFilled >= work.aRequired) throw new AppError('WORK_FULL', 'Category A positions are full');
    if (cat === 'B' && work.bFilled >= work.bRequired) throw new AppError('WORK_FULL', 'Category B positions are full');
    if (cat === 'C' && work.cFilled >= work.cRequired) throw new AppError('WORK_FULL', 'Category C positions are full');

    // Get current standard base wage snapshot
    const wageSettings = this.getWageSettings();
    const baseWage = cat === 'A' ? wageSettings.categoryA : cat === 'B' ? wageSettings.categoryB : wageSettings.categoryC;

    // Increment quotas atomically
    if (cat === 'A') work.aFilled += 1;
    else if (cat === 'B') work.bFilled += 1;
    else work.cFilled += 1;
    work.totalFilled += 1;

    if (work.totalFilled >= work.totalRequired) {
      work.status = 'full';
    }
    work.updatedAt = new Date().toISOString();

    const allWorks = this.getWorks();
    const wIdx = allWorks.findIndex(w => w.id === workId);
    if (wIdx >= 0) allWorks[wIdx] = work;
    this.setItem('works', allWorks);

    // Save membership
    const memberId = `${workId}_${boy.uid}`;
    const allMembers = this.getItem<WorkMember[]>('work_members', []);
    const memberIdx = allMembers.findIndex(m => m.id === memberId);
    const memberObj: WorkMember = {
      id: memberId,
      workId,
      userId: boy.uid,
      membershipStatus: 'active',
      joinedAt: new Date().toISOString(),
      joinedBy: boy.fullName,
      snapshotName: boy.fullName,
      snapshotBoyId: boy.currentOfficialId,
      snapshotCategory: cat,
      snapshotBaseWage: baseWage,
    };

    if (memberIdx >= 0) {
      allMembers[memberIdx] = memberObj;
    } else {
      allMembers.push(memberObj);
    }
    this.setItem('work_members', allMembers);

    // Acquire lock
    locks.push(lockKey);
    this.setItem('daily_locks', locks);

    // Write audit log
    this.addAuditLog({
      actorId: boy.uid,
      actorNameSnapshot: boy.fullName,
      actorOfficialIdSnapshot: boy.currentOfficialId,
      actionType: 'boy_took_work',
      workId,
      affectedUserId: boy.uid,
      newValue: { category: cat, baseWage },
    });

    // Send Boy confirmation notification
    this.sendNotification({
      userId: boy.uid,
      title: 'Work Confirmed!',
      message: `You have successfully joined "${work.name}" on ${work.workDate}. Reporting time: ${work.reportingTime}.`,
      type: 'work',
      targetUrl: `/boy/confirmed/${workId}`,
    });

    return memberObj;
  }

  // LEAVE WORK BEFORE WORK DATE
  public leaveWork(workId: string, boy: UserProfile): void {
    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');

    const todayStr = new Date().toISOString().split('T')[0];
    if (todayStr >= work.workDate) {
      throw new AppError('LEAVE_NOT_ALLOWED');
    }

    const allMembers = this.getItem<WorkMember[]>('work_members', []);
    const memberId = `${workId}_${boy.uid}`;
    const member = allMembers.find(m => m.id === memberId && m.membershipStatus === 'active');
    if (!member) throw new AppError('UNKNOWN', 'You are not active on this Work');

    member.membershipStatus = 'left';
    member.leftAt = new Date().toISOString();
    this.setItem('work_members', allMembers);

    // Release daily lock
    const locks = this.getItem<string[]>('daily_locks', []);
    const lockKey = `${boy.uid}_${work.workDate}`;
    this.setItem('daily_locks', locks.filter(l => l !== lockKey));

    // Decrement capacity
    const cat = member.snapshotCategory;
    if (cat === 'A' && work.aFilled > 0) work.aFilled -= 1;
    else if (cat === 'B' && work.bFilled > 0) work.bFilled -= 1;
    else if (cat === 'C' && work.cFilled > 0) work.cFilled -= 1;
    if (work.totalFilled > 0) work.totalFilled -= 1;

    if (work.status === 'full' && work.totalFilled < work.totalRequired) {
      work.status = 'available';
    }
    work.updatedAt = new Date().toISOString();

    const allWorks = this.getWorks();
    const wIdx = allWorks.findIndex(w => w.id === workId);
    if (wIdx >= 0) allWorks[wIdx] = work;
    this.setItem('works', allWorks);

    this.addAuditLog({
      actorId: boy.uid,
      actorNameSnapshot: boy.fullName,
      actorOfficialIdSnapshot: boy.currentOfficialId,
      actionType: 'boy_left_work',
      workId,
      affectedUserId: boy.uid,
    });

    // Notify Boy and Main Site Captain
    this.sendNotification({
      userId: boy.uid,
      title: 'Left Work',
      message: `You have left "${work.name}". Vacancy is now released.`,
      type: 'work',
    });

    if (work.mainSiteCaptainId) {
      this.sendNotification({
        userId: work.mainSiteCaptainId,
        title: 'Worker Left Work',
        message: `${boy.fullName} (${boy.currentOfficialId}) has left "${work.name}".`,
        type: 'work',
      });
    }
  }

  // MANAGEMENT REMOVE BOY
  public removeBoyFromWork(workId: string, boyId: string, actor: UserProfile): void {
    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');

    const allMembers = this.getItem<WorkMember[]>('work_members', []);
    const memberId = `${workId}_${boyId}`;
    const member = allMembers.find(m => m.id === memberId && m.membershipStatus === 'active');
    if (!member) return;

    member.membershipStatus = 'removed';
    member.removedAt = new Date().toISOString();
    this.setItem('work_members', allMembers);

    // Release lock
    const locks = this.getItem<string[]>('daily_locks', []);
    const lockKey = `${boyId}_${work.workDate}`;
    this.setItem('daily_locks', locks.filter(l => l !== lockKey));

    // Decrement capacity
    const cat = member.snapshotCategory;
    if (cat === 'A' && work.aFilled > 0) work.aFilled -= 1;
    else if (cat === 'B' && work.bFilled > 0) work.bFilled -= 1;
    else if (cat === 'C' && work.cFilled > 0) work.cFilled -= 1;
    if (work.totalFilled > 0) work.totalFilled -= 1;

    if (work.status === 'full' && work.totalFilled < work.totalRequired) {
      work.status = 'available';
    }
    this.updateWork(workId, work, actor);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'boy_removed_by_management',
      workId,
      affectedUserId: boyId,
    });

    this.sendNotification({
      userId: boyId,
      title: 'Removed from Work',
      message: `You were removed from "${work.name}" by management.`,
      type: 'work',
    });
  }

  // MANAGEMENT RE-ADD BOY
  public readdBoyToWork(workId: string, boyId: string, actor: UserProfile, ownerOverride: boolean = false): void {
    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');
    const boy = this.getUserById(boyId);
    if (!boy) throw new AppError('UNKNOWN', 'Boy not found');

    const locks = this.getItem<string[]>('daily_locks', []);
    const lockKey = `${boyId}_${work.workDate}`;
    if (locks.includes(lockKey) && !ownerOverride) {
      throw new AppError('DAY_CONFLICT');
    }

    const allMembers = this.getItem<WorkMember[]>('work_members', []);
    const memberId = `${workId}_${boyId}`;
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    member.membershipStatus = 'active';
    member.readdedAt = new Date().toISOString();
    member.ownerOverride = ownerOverride;
    this.setItem('work_members', allMembers);

    if (!locks.includes(lockKey)) {
      locks.push(lockKey);
      this.setItem('daily_locks', locks);
    }

    // Increment capacity
    const cat = member.snapshotCategory;
    if (cat === 'A') work.aFilled += 1;
    else if (cat === 'B') work.bFilled += 1;
    else work.cFilled += 1;
    work.totalFilled += 1;

    if (work.totalFilled >= work.totalRequired) {
      work.status = 'full';
    }
    this.updateWork(workId, work, actor);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'boy_readded_by_management',
      workId,
      affectedUserId: boyId,
      newValue: { ownerOverride },
    });

    this.sendNotification({
      userId: boyId,
      title: 'Re-added to Work',
      message: `You have been re-added to "${work.name}".`,
      type: 'work',
    });
  }

  // --- Attendance ---
  public getWorkAttendance(workId: string): WorkAttendance[] {
    const all = this.getItem<WorkAttendance[]>('work_attendance', []);
    return all.filter(a => a.workId === workId);
  }

  public setAttendance(workId: string, boyId: string, status: AttendanceStatus, actor: UserProfile): void {
    const all = this.getItem<WorkAttendance[]>('work_attendance', []);
    const id = `${workId}_${boyId}`;
    const idx = all.findIndex(a => a.id === id);

    const now = new Date().toISOString();
    if (idx >= 0) {
      all[idx].status = status;
      all[idx].markedAt = now;
      all[idx].markedBy = actor.fullName;
      all[idx].updatedAt = now;
    } else {
      all.push({
        id,
        workId,
        boyId,
        workMemberId: id,
        status,
        markedAt: now,
        markedBy: actor.fullName,
        updatedAt: now,
      });
    }

    this.setItem('work_attendance', all);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'attendance_marked',
      workId,
      affectedUserId: boyId,
      newValue: { status },
    });
  }

  // --- Wages & Publishing ---
  public getWorkWages(workId: string): WorkWage[] {
    const all = this.getItem<WorkWage[]>('work_wages', []);
    return all.filter(w => w.workId === workId);
  }

  public ensureWorkWageDraft(workId: string, boyId: string, category: BoyCategory, baseWage: number): WorkWage {
    const all = this.getItem<WorkWage[]>('work_wages', []);
    const id = `${workId}_${boyId}`;
    let wage = all.find(w => w.id === id);

    if (!wage) {
      wage = {
        id,
        workId,
        boyId,
        memberId: id,
        categorySnapshot: category,
        baseWage,
        draftAdjustment: 0,
        draftTotal: baseWage,
        publishedVersion: 0,
        isPublished: false,
      };
      all.push(wage);
      this.setItem('work_wages', all);
    }
    return wage;
  }

  public saveWageDraft(workId: string, boyId: string, adjustment: number, actor: UserProfile): WorkWage {
    const all = this.getItem<WorkWage[]>('work_wages', []);
    const id = `${workId}_${boyId}`;
    const wage = all.find(w => w.id === id);
    if (!wage) throw new AppError('UNKNOWN', 'Wage record not initialized');

    wage.draftAdjustment = adjustment;
    wage.draftTotal = Number(wage.baseWage) + Number(adjustment);
    this.setItem('work_wages', all);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'wage_draft_saved',
      workId,
      affectedUserId: boyId,
      newValue: { draftAdjustment: adjustment, draftTotal: wage.draftTotal },
    });

    return wage;
  }

  public publishWage(workId: string, boyId: string, actor: UserProfile): WorkWage {
    const work = this.getWorkById(workId);
    if (!work) throw new AppError('WORK_NOT_FOUND');
    const all = this.getItem<WorkWage[]>('work_wages', []);
    const id = `${workId}_${boyId}`;
    const wage = all.find(w => w.id === id);
    if (!wage) throw new AppError('UNKNOWN', 'Wage record not initialized');

    const prevVersion = wage.publishedVersion || 0;
    wage.publishedBase = wage.baseWage;
    wage.publishedAdjustment = wage.draftAdjustment;
    wage.publishedTotal = wage.draftTotal;
    wage.publishedVersion = prevVersion + 1;
    wage.publishedAt = new Date().toISOString();
    wage.publishedBy = actor.fullName;
    wage.isPublished = true;
    this.setItem('work_wages', all);

    // Save/Update Boy's published wage view
    const userWageViews = this.getItem<UserWageView[]>(`user_wage_views_${boyId}`, []);
    const viewIdx = userWageViews.findIndex(v => v.workId === workId);
    const existingPayment = this.getWorkPayment(workId, boyId);

    const newView: UserWageView = {
      workId,
      workName: work.name,
      workDate: work.workDate,
      categorySnapshot: wage.categorySnapshot,
      publishedBase: wage.publishedBase,
      publishedAdjustment: wage.publishedAdjustment,
      publishedTotal: wage.publishedTotal,
      publishedVersion: wage.publishedVersion,
      publishedAt: wage.publishedAt,
      paymentStatus: existingPayment?.status || 'unpaid',
      paidAt: existingPayment?.paidAt,
    };

    if (viewIdx >= 0) {
      userWageViews[viewIdx] = newView;
    } else {
      userWageViews.push(newView);
    }
    this.setItem(`user_wage_views_${boyId}`, userWageViews);

    // Append wage revision history
    const revisions = this.getItem<any[]>('wage_revisions', []);
    revisions.push({
      id: `rev_${workId}_${boyId}_${wage.publishedVersion}`,
      workId,
      boyId,
      version: wage.publishedVersion,
      publishedBase: wage.publishedBase,
      publishedAdjustment: wage.publishedAdjustment,
      publishedTotal: wage.publishedTotal,
      publishedAt: wage.publishedAt,
      publishedBy: actor.fullName,
    });
    this.setItem('wage_revisions', revisions);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: prevVersion > 0 ? 'wage_republished' : 'wage_published',
      workId,
      affectedUserId: boyId,
      newValue: { total: wage.publishedTotal, version: wage.publishedVersion },
    });

    this.sendNotification({
      userId: boyId,
      title: 'Wage Published',
      message: `Your wage for "${work.name}" has been published: ₹${wage.publishedTotal}.`,
      type: 'wage',
      targetUrl: `/boy/payments`,
    });

    return wage;
  }

  public getUserWageViews(boyId: string): UserWageView[] {
    return this.getItem<UserWageView[]>(`user_wage_views_${boyId}`, []);
  }

  // --- Billers & Payments ---
  public getWorkBillers(workId: string): WorkBiller[] {
    const all = this.getItem<WorkBiller[]>('work_billers', []);
    return all.filter(b => b.workId === workId);
  }

  public assignBiller(workId: string, boyId: string, captainId: string, actor: UserProfile): void {
    const captains = this.getWorkCaptains(workId).filter(c => c.active);
    const captain = captains.find(c => c.captainId === captainId);
    if (!captain) throw new AppError('INVALID_BILLER');

    const all = this.getItem<WorkBiller[]>('work_billers', []);
    const id = `${workId}_${boyId}`;
    const idx = all.findIndex(b => b.id === id);
    const oldBiller = idx >= 0 ? all[idx] : null;

    const newBiller: WorkBiller = {
      id,
      workId,
      boyId,
      captainId,
      billerName: captain.snapshotName,
      billerOfficialId: captain.snapshotOfficialId,
      assignedAt: new Date().toISOString(),
      assignedBy: actor.fullName,
    };

    if (idx >= 0) all[idx] = newBiller;
    else all.push(newBiller);
    this.setItem('work_billers', all);

    // Initialize or link payment record
    const wage = this.getWorkWages(workId).find(w => w.boyId === boyId);
    const payments = this.getItem<WorkPayment[]>('work_payments', []);
    const pIdx = payments.findIndex(p => p.id === id);

    if (pIdx >= 0) {
      payments[pIdx].billerId = captainId;
      payments[pIdx].billerName = captain.snapshotName;
      if (wage?.publishedTotal) payments[pIdx].amount = wage.publishedTotal;
    } else {
      payments.push({
        id,
        workId,
        boyId,
        billerId: captainId,
        billerName: captain.snapshotName,
        wageVersion: wage?.publishedVersion || 1,
        amount: wage?.publishedTotal || wage?.draftTotal || 0,
        status: 'unpaid',
        lastChangedAt: new Date().toISOString(),
        lastChangedBy: actor.fullName,
      });
    }
    this.setItem('work_payments', payments);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: oldBiller ? 'biller_changed' : 'biller_assigned',
      workId,
      affectedUserId: boyId,
      oldValue: oldBiller ? { billerId: oldBiller.captainId } : null,
      newValue: { billerId: captainId, billerName: captain.snapshotName },
    });
  }

  public getWorkPayments(workId: string): WorkPayment[] {
    const all = this.getItem<WorkPayment[]>('work_payments', []);
    return all.filter(p => p.workId === workId);
  }

  public getAllPayments(): WorkPayment[] {
    return this.getItem<WorkPayment[]>('work_payments', []);
  }

  public getWorkPayment(workId: string, boyId: string): WorkPayment | undefined {
    return this.getWorkPayments(workId).find(p => p.boyId === boyId);
  }

  public setPaymentStatus(workId: string, boyId: string, newStatus: PaymentStatus, actor: UserProfile): void {
    const payments = this.getItem<WorkPayment[]>('work_payments', []);
    const id = `${workId}_${boyId}`;
    const payment = payments.find(p => p.id === id);
    if (!payment) throw new AppError('UNKNOWN', 'Payment record not found');

    const prevStatus = payment.status;
    payment.status = newStatus;
    payment.paidAt = newStatus === 'paid' ? new Date().toISOString() : undefined;
    payment.lastChangedAt = new Date().toISOString();
    payment.lastChangedBy = actor.fullName;
    this.setItem('work_payments', payments);

    // Update user published wage view
    const userWageViews = this.getItem<UserWageView[]>(`user_wage_views_${boyId}`, []);
    const view = userWageViews.find(v => v.workId === workId);
    if (view) {
      view.paymentStatus = newStatus;
      view.paidAt = payment.paidAt;
      this.setItem(`user_wage_views_${boyId}`, userWageViews);
    }

    // Append immutable payment event
    const events = this.getItem<PaymentEvent[]>('payment_events', []);
    events.push({
      id: `pe_${Date.now()}_${id}`,
      workId,
      boyId,
      billerId: payment.billerId,
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      previousStatus: prevStatus,
      newStatus,
      amount: payment.amount,
      timestamp: new Date().toISOString(),
    });
    this.setItem('payment_events', events);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'payment_status_changed',
      workId,
      affectedUserId: boyId,
      oldValue: prevStatus,
      newValue: newStatus,
    });

    this.sendNotification({
      userId: boyId,
      title: 'Payment Status Updated',
      message: `Your payment of ₹${payment.amount} has been marked as ${newStatus.toUpperCase()}.`,
      type: 'payment',
      targetUrl: `/boy/payments`,
    });
  }

  public getPaymentEvents(workId?: string, boyId?: string): PaymentEvent[] {
    const all = this.getItem<PaymentEvent[]>('payment_events', []);
    return all.filter(e => (!workId || e.workId === workId) && (!boyId || e.boyId === boyId));
  }

  // --- Captain Wages ---
  public getCaptainWages(captainId?: string): CaptainWage[] {
    const all = this.getItem<CaptainWage[]>('captain_wages', []);
    return captainId ? all.filter(cw => cw.captainId === captainId) : all;
  }

  public recordCaptainWage(payload: Omit<CaptainWage, 'id' | 'status' | 'createdAt' | 'updatedAt'>, actor: UserProfile): CaptainWage {
    const all = this.getCaptainWages();
    const id = `cw_${payload.workId}_${payload.captainId}`;
    const idx = all.findIndex(w => w.id === id);

    const now = new Date().toISOString();
    const record: CaptainWage = {
      ...payload,
      id,
      status: 'unpaid',
      createdAt: now,
      updatedAt: now,
    };

    if (idx >= 0) all[idx] = { ...all[idx], ...payload, updatedAt: now };
    else all.push(record);
    this.setItem('captain_wages', all);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'captain_wage_recorded',
      workId: payload.workId,
      affectedUserId: payload.captainId,
      newValue: { amount: payload.wageAmount },
    });

    return record;
  }

  public setCaptainWagePaymentStatus(recordId: string, status: PaymentStatus, actor: UserProfile): void {
    const all = this.getCaptainWages();
    const record = all.find(r => r.id === recordId);
    if (!record) throw new AppError('UNKNOWN', 'Captain wage record not found');

    record.status = status;
    record.paidAt = status === 'paid' ? new Date().toISOString() : undefined;
    record.updatedAt = new Date().toISOString();
    this.setItem('captain_wages', all);

    this.addAuditLog({
      actorId: actor.uid,
      actorNameSnapshot: actor.fullName,
      actorOfficialIdSnapshot: actor.currentOfficialId,
      actionType: 'captain_payment_changed',
      workId: record.workId,
      affectedUserId: record.captainId,
      newValue: { status },
    });

    this.sendNotification({
      userId: record.captainId,
      title: 'Captain Wage Payment',
      message: `Your wage payment of ₹${record.wageAmount} for "${record.workName}" was marked ${status.toUpperCase()}.`,
      type: 'wage',
      targetUrl: '/captain/wages',
    });
  }

  // --- Notifications ---
  public getNotifications(userId: string): NotificationItem[] {
    const all = this.getItem<NotificationItem[]>(`notifications_${userId}`, []);
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public sendNotification(item: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>): void {
    const all = this.getItem<NotificationItem[]>(`notifications_${item.userId}`, []);
    all.push({
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    });
    this.setItem(`notifications_${item.userId}`, all);
  }

  public markNotificationAsRead(userId: string, notifId: string): void {
    const all = this.getItem<NotificationItem[]>(`notifications_${userId}`, []);
    const target = all.find(n => n.id === notifId);
    if (target) {
      target.isRead = true;
      this.setItem(`notifications_${userId}`, all);
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    const all = this.getItem<NotificationItem[]>(`notifications_${userId}`, []);
    all.forEach(n => { n.isRead = true; });
    this.setItem(`notifications_${userId}`, all);
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    const all = this.getItem<AuditLog[]>('audit_logs', []);
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): void {
    const all = this.getItem<AuditLog[]>('audit_logs', []);
    all.push({
      ...log,
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    });
    this.setItem('audit_logs', all);
  }

  // Clear all local cache / state
  public clearAllData(): void {
    const keys = [
      'users', 'works', 'work_public', 'work_members', 'work_captains',
      'work_billers', 'applications', 'attendance', 'payments', 'captain_wages',
      'notifications', 'audit_logs', 'user_id_history', 'offline_queue', 'wage_settings', 'system_settings'
    ];
    keys.forEach(k => {
      try {
        localStorage.removeItem(STORAGE_PREFIX + k);
      } catch {}
    });
    try {
      localStorage.removeItem('cwm_current_auth_uid');
      localStorage.removeItem('cwm_demo_seeded');
    } catch {}
    this.notify();
  }

  // Ensure any old demo users from previous runs are permanently purged
  public purgeLegacyDemoData(): void {
    const users = this.getUsers();
    if (users.some(u => u.uid === 'owner_main' || u.uid === 'boy_suresh' || u.uid.startsWith('cpt_') || u.uid.startsWith('boy_'))) {
      this.clearAllData();
      console.info('Legacy demo data purged successfully.');
    }
  }

  // Real-time Cloud Firestore synchronization
  private firestoreInitialized = false;
  public initFirestoreSync(): void {
    if (this.firestoreInitialized || !isFirebaseConfigured()) return;
    this.firestoreInitialized = true;

    try {
      const collections = [
        'users',
        'works',
        'work_public',
        'work_members',
        'work_captains',
        'work_billers',
        'applications',
        'attendance',
        'payments',
        'captain_wages',
        'notifications',
        'audit_logs'
      ];

      collections.forEach((colName) => {
        onSnapshot(collection(db, colName), (snapshot) => {
          if (!snapshot.empty) {
            const docs = snapshot.docs.map((d) => d.data());
            this.setItem(colName, docs);
          }
        }, (err) => {
          console.warn(`Firestore sync [${colName}]:`, err.message);
        });
      });
    } catch (e) {
      console.warn('Firestore initialization note:', e);
    }
  }
}

export const workforceService = new WorkforceService();
workforceService.purgeLegacyDemoData();
workforceService.initFirestoreSync();
