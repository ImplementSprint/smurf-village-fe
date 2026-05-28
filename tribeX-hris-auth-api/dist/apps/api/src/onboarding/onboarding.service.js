"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OnboardingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("node:crypto"));
const supabase_1 = require("../../../../libs/supabase/src");
const mail_service_1 = require("../mail/mail.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
const timekeeping_service_1 = require("../timekeeping/timekeeping.service");
const common_2 = require("../../../../libs/common/src");
function getManilaDateKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}
const MULTI_PORTAL_ELIGIBLE_ROLES = new Set([
    'hr officer',
    'hr recruiter',
    'hr interviewer',
    'hr compensation and benefits officer',
    'hr offboarding officer/coordinator',
    'hr onboarding officer',
    'hr performance management officer',
    'manager',
    'group head',
    'admin',
    'system admin',
]);
function roleNameToPortal(roleName) {
    const normalized = String(roleName ?? '').trim().toLowerCase();
    if (normalized === 'system admin')
        return 'system-admin';
    if (normalized === 'admin')
        return 'admin';
    if (normalized === 'manager' || normalized === 'group head')
        return 'manager';
    if (normalized === 'active employee' || normalized === 'employee')
        return 'employee';
    if (normalized === 'applicant')
        return 'applicant';
    return 'hr';
}
let OnboardingService = OnboardingService_1 = class OnboardingService {
    supabaseService;
    mailService;
    config;
    auditService;
    notificationsService;
    timekeepingService;
    logger = new common_1.Logger(OnboardingService_1.name);
    constructor(supabaseService, mailService, config, auditService, notificationsService, timekeepingService) {
        this.supabaseService = supabaseService;
        this.mailService = mailService;
        this.config = config;
        this.auditService = auditService;
        this.notificationsService = notificationsService;
        this.timekeepingService = timekeepingService;
    }
    normalizeDocType(title) {
        const map = {
            'government id': 'government-id',
            'tax form': 'tax-form',
            'signed employment contract': 'employment-contract',
            'employment contract': 'employment-contract',
            'bank details / payroll form': 'bank-details',
            'bank details': 'bank-details',
            'payroll form': 'bank-details',
        };
        const key = title.toLowerCase().trim();
        return map[key] ?? key.replace(/\s*\/\s*/g, '-').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    async getSessionContext(sessionId) {
        const supabase = this.supabaseService.getClient();
        const { data: sess } = await supabase
            .from('onboarding_sessions')
            .select('account_id')
            .eq('session_id', sessionId)
            .maybeSingle();
        if (!sess)
            return null;
        const accountId = sess.account_id;
        const { data: profile } = await supabase
            .from('user_profile')
            .select('first_name, last_name, email, company_id')
            .eq('user_id', accountId)
            .maybeSingle();
        if (profile) {
            return {
                accountId,
                companyId: profile.company_id ?? '',
                employeeName: `${profile.first_name} ${profile.last_name}`,
                employeeEmail: profile.email ?? '',
            };
        }
        const { data: applicant } = await supabase
            .from('applicant_profile')
            .select('first_name, last_name, email, company_id')
            .eq('applicant_id', accountId)
            .maybeSingle();
        return {
            accountId,
            companyId: applicant?.company_id ?? '',
            employeeName: applicant ? `${applicant.first_name} ${applicant.last_name}` : 'Employee',
            employeeEmail: applicant?.email ?? '',
        };
    }
    getRemarkTabTagCandidates(rawTabTag) {
        const normalized = rawTabTag.trim().toLowerCase();
        const canonicalMap = {
            documents: ['Documents', 'documents'],
            tasks: ['Tasks', 'tasks'],
            equipment: ['Equipment', 'equipment'],
            profile: ['Profile', 'profile'],
            forms: ['Forms', 'HR Forms', 'forms', 'hr_forms'],
            hr_forms: ['Forms', 'HR Forms', 'forms', 'hr_forms'],
            'hr forms': ['Forms', 'HR Forms', 'forms', 'hr_forms'],
        };
        const candidates = canonicalMap[normalized] ?? [rawTabTag.trim()];
        return [...new Set(candidates)];
    }
    async getMySession(accountId, sessionId) {
        const supabase = this.supabaseService.getClient();
        const sessionQuery = supabase
            .from('onboarding_sessions')
            .select('*');
        const sessionLookup = sessionId
            ? sessionQuery
                .eq('session_id', sessionId)
                .limit(1)
            : sessionQuery
                .eq('account_id', accountId)
                .order('deadline_date', { ascending: false })
                .limit(1);
        const { data: session, error: sessionErr } = await sessionLookup.maybeSingle();
        if (sessionErr)
            throw new common_1.BadRequestException(sessionErr.message);
        if (!session)
            return null;
        const { data: template } = await supabase
            .from('onboarding_templates')
            .select('name')
            .eq('template_id', session.template_id)
            .maybeSingle();
        const { data: user } = await supabase
            .from('user_profile')
            .select('first_name, last_name, employee_id')
            .eq('user_id', accountId)
            .maybeSingle();
        let applicantProfile = null;
        if (!user) {
            const { data: ap } = await supabase
                .from('applicant_profile')
                .select('first_name, last_name')
                .eq('applicant_id', accountId)
                .maybeSingle();
            applicantProfile = ap ?? null;
        }
        const { data: items, error: itemsErr } = await supabase
            .from('onboarding_items')
            .select(`
        onboarding_item_id,
        session_id,
        template_item_id,
        status,
        is_requested,
        delivery_method,
        delivery_address,
        template_items (
          item_id,
          type,
          tab_category,
          title,
          description,
          rich_content,
          is_required
        )
      `)
            .eq('session_id', session.session_id);
        if (itemsErr)
            throw new common_1.BadRequestException(itemsErr.message);
        const itemIds = (items || []).map(i => i.onboarding_item_id);
        let submissions = [];
        if (itemIds.length > 0) {
            const { data } = await supabase
                .from('onboarding_documents')
                .select('*')
                .in('onboarding_item_id', itemIds);
            const rawSubmissions = data || [];
            submissions = await Promise.all(rawSubmissions.map(async (submission) => {
                if (!submission.file_path)
                    return submission;
                const { data: signedUrlData, error: signedUrlError } = await supabase.storage
                    .from('onboarding-documents')
                    .createSignedUrl(submission.file_path, 60 * 60 * 24 * 7);
                if (signedUrlError) {
                    this.logger.warn(`[getMySession] Failed to refresh signed URL for submission ${submission.submission_id}: ${signedUrlError.message}`);
                    return submission;
                }
                return {
                    ...submission,
                    file_url: signedUrlData?.signedUrl || submission.file_url,
                };
            }));
        }
        const { data: remarks } = await supabase
            .from('onboarding_remarks')
            .select(`
        remark_id,
        session_id,
        author_id,
        tab_tag,
        remark_text,
        created_at
      `)
            .eq('session_id', session.session_id)
            .order('created_at', { ascending: true });
        const authorIds = [...new Set((remarks || []).map(r => r.author_id))];
        let authorMap = {};
        if (authorIds.length > 0) {
            const { data: authors } = await supabase
                .from('user_profile')
                .select('user_id, first_name, last_name')
                .in('user_id', authorIds);
            for (const a of authors || []) {
                authorMap[a.user_id] = `${a.first_name} ${a.last_name}`;
            }
        }
        const { data: profile } = await supabase
            .from('employee_staging')
            .select('*')
            .eq('session_id', session.session_id)
            .maybeSingle();
        const grouped = {
            documents: [],
            tasks: [],
            equipment: [],
            hr_forms: [],
            profile_items: [],
            welcome: [],
        };
        for (const item of items || []) {
            const ti = item.template_items;
            if (!ti)
                continue;
            const category = ti.tab_category;
            const itemSubmissions = submissions.filter(s => s.onboarding_item_id === item.onboarding_item_id);
            const base = {
                onboarding_item_id: item.onboarding_item_id,
                title: ti.title,
                status: item.status,
                is_required: ti.is_required,
                type: ti.type,
                description: ti.description,
                rich_content: ti.rich_content,
            };
            if (category === 'documents') {
                grouped.documents.push({
                    ...base,
                    files: itemSubmissions.filter(s => !s.is_proof_of_receipt),
                    upload_history: itemSubmissions.filter(s => !s.is_proof_of_receipt),
                });
            }
            else if (category === 'tasks') {
                grouped.tasks.push(base);
            }
            else if (category === 'equipment') {
                grouped.equipment.push({
                    ...base,
                    is_requested: item.is_requested,
                    delivery_method: item.delivery_method,
                    delivery_address: item.delivery_address,
                    proof_of_receipt: itemSubmissions.filter(s => s.is_proof_of_receipt),
                });
            }
            else if (category === 'hr_forms') {
                grouped.hr_forms.push(base);
            }
            else if (category === 'profile') {
                grouped.profile_items.push(base);
            }
            else if (category === 'welcome') {
                grouped.welcome.push(base);
            }
        }
        const formattedRemarks = (remarks || []).map(r => ({
            remark_id: r.remark_id,
            tab_tag: r.tab_tag,
            remark_text: r.remark_text,
            created_at: r.created_at,
            author: authorMap[r.author_id] || 'Unknown',
        }));
        return {
            session_id: session.session_id,
            account_id: session.account_id,
            template_id: session.template_id,
            template_name: template?.name || null,
            employee_name: user
                ? `${user.first_name} ${user.last_name}`
                : applicantProfile
                    ? `${applicantProfile.first_name} ${applicantProfile.last_name}`
                    : null,
            employee_id: user?.employee_id || null,
            assigned_position: session.assigned_position,
            assigned_department: session.assigned_department,
            offer_status: session.offer_status ?? 'accepted',
            status: session.status,
            progress_percentage: session.progress_percentage,
            deadline_date: session.deadline_date,
            completed_at: session.completed_at,
            documents: grouped.documents,
            tasks: grouped.tasks,
            equipment: grouped.equipment,
            hr_forms: grouped.hr_forms,
            profile_items: grouped.profile_items,
            welcome: grouped.welcome,
            profile: profile || null,
            remarks: formattedRemarks,
        };
    }
    async uploadDocument(onboardingItemId, file, isProofOfReceipt = false) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded.');
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only PDF, JPG, and PNG allowed.');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File is too large. Maximum size is 5MB.');
        }
        const supabase = this.supabaseService.getClient();
        const { data: item, error: itemErr } = await supabase
            .from('onboarding_items')
            .select('onboarding_item_id, session_id, status')
            .eq('onboarding_item_id', onboardingItemId)
            .single();
        if (itemErr || !item)
            throw new common_1.NotFoundException('Onboarding item not found.');
        if (!isProofOfReceipt && !['pending', 'rejected'].includes(item.status)) {
            throw new common_1.BadRequestException('This document is locked while awaiting HR review. You can reupload only after HR rejects it.');
        }
        const filePath = `${item.session_id}/${onboardingItemId}/${Date.now()}_${file.originalname}`;
        const { error: uploadErr } = await supabase.storage
            .from('onboarding-documents')
            .upload(filePath, file.buffer, { contentType: file.mimetype });
        if (uploadErr)
            throw new common_1.BadRequestException(`Upload failed: ${uploadErr.message}`);
        const { data: urlData } = await supabase.storage
            .from('onboarding-documents')
            .createSignedUrl(filePath, 60 * 60 * 24 * 7);
        const fileUrl = urlData?.signedUrl || filePath;
        const { data: submission, error: subErr } = await supabase
            .from('onboarding_documents')
            .insert({
            submission_id: crypto.randomUUID(),
            onboarding_item_id: onboardingItemId,
            file_url: fileUrl,
            file_path: filePath,
            file_name: file.originalname,
            file_size_bytes: file.size,
            file_type: file.mimetype,
            is_proof_of_receipt: isProofOfReceipt,
            status: 'uploaded',
            uploaded_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (subErr)
            throw new common_1.BadRequestException(subErr.message);
        await supabase
            .from('onboarding_items')
            .update({ status: 'submitted' })
            .eq('onboarding_item_id', onboardingItemId);
        await this.recalculateProgress(item.session_id);
        const ctx = await this.getSessionContext(item.session_id);
        if (ctx) {
            this.auditService.log(`DOCUMENT_UPLOAD: item ${onboardingItemId}`, ctx.accountId, ctx.companyId).catch(err => this.logger.error('Failed to write audit log in uploadDocument', err));
        }
        this.logger.log(`File uploaded for item: ${onboardingItemId}`);
        return submission;
    }
    async uploadTemplateImage(file) {
        if (!file)
            throw new common_1.BadRequestException('No image uploaded.');
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid image type. Only JPG, PNG, WebP, and GIF images are allowed.');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('Image is too large. Maximum size is 5MB.');
        }
        const supabase = this.supabaseService.getClient();
        const bucket = 'onboarding-template-assets';
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError)
            throw new common_1.InternalServerErrorException(listError.message);
        const exists = buckets?.some((b) => b.name === bucket);
        if (!exists) {
            const { error: createError } = await supabase.storage.createBucket(bucket, {
                public: true,
                fileSizeLimit: 5 * 1024 * 1024,
                allowedMimeTypes: allowedTypes,
            });
            if (createError)
                throw new common_1.InternalServerErrorException(createError.message);
        }
        const safeName = file.originalname
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9._-]/g, '');
        const filePath = `rich-content/${Date.now()}-${crypto.randomUUID()}-${safeName || 'image'}`;
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (uploadError)
            throw new common_1.BadRequestException(`Upload failed: ${uploadError.message}`);
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return {
            url: publicData.publicUrl,
            path: filePath,
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
        };
    }
    async uploadTrainingVideo(file) {
        if (!file)
            throw new common_1.BadRequestException('No video file uploaded.');
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Allowed: MP4, WebM, OGG, MOV, AVI, MKV.');
        }
        const maxBytes = 100 * 1024 * 1024;
        if (file.size > maxBytes) {
            throw new common_1.BadRequestException('Video file too large. Maximum size is 100 MB.');
        }
        const supabase = this.supabaseService.getClient();
        const bucket = 'onboarding-training-videos';
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError)
            throw new common_1.InternalServerErrorException(listError.message);
        const exists = buckets?.some((b) => b.name === bucket);
        if (!exists) {
            const { error: createError } = await supabase.storage.createBucket(bucket, { public: true });
            if (createError)
                throw new common_1.InternalServerErrorException(createError.message);
        }
        await supabase.storage.updateBucket(bucket, {
            public: true,
            fileSizeLimit: maxBytes,
            allowedMimeTypes: allowedTypes,
        });
        const safeName = (file.originalname || 'video')
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9._-]/g, '');
        const filePath = `uploads/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (uploadError)
            throw new common_1.BadRequestException(`Upload failed: ${uploadError.message}`);
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return {
            url: publicData.publicUrl,
            path: filePath,
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: file.size,
        };
    }
    async confirmTask(onboardingItemId) {
        const supabase = this.supabaseService.getClient();
        const { data: item, error } = await supabase
            .from('onboarding_items')
            .select('onboarding_item_id, session_id')
            .eq('onboarding_item_id', onboardingItemId)
            .single();
        if (error || !item)
            throw new common_1.NotFoundException('Onboarding item not found.');
        await supabase
            .from('onboarding_items')
            .update({ status: 'confirmed' })
            .eq('onboarding_item_id', onboardingItemId);
        await this.recalculateProgress(item.session_id);
        this.logger.log(`Task confirmed: ${onboardingItemId}`);
        return { message: 'Task confirmed successfully', onboarding_item_id: onboardingItemId, status: 'confirmed' };
    }
    async saveProfile(sessionId, dto) {
        const supabase = this.supabaseService.getClient();
        const { contact_name, relationship, emergency_phone_number, emergency_email_address, ...profileFields } = dto;
        const firstContact = dto.emergency_contacts?.[0];
        const payload = {
            ...profileFields,
            first_name: (0, common_2.normalizeNamePart)(dto.first_name),
            middle_name: (0, common_2.normalizeNamePart)(dto.middle_name) ?? null,
            last_name: (0, common_2.normalizeNamePart)(dto.last_name),
            emergency_contacts: dto.emergency_contacts ?? [],
            status: 'submitted',
            contact_name: firstContact?.contact_name ?? contact_name ?? '',
            relationship: firstContact?.relationship ?? relationship ?? '',
            emergency_phone_number: firstContact?.emergency_phone_number ?? emergency_phone_number ?? '',
            emergency_email_address: firstContact?.emergency_email_address ?? emergency_email_address ?? null,
        };
        const { data: existing } = await supabase
            .from('employee_staging')
            .select('profile_id')
            .eq('session_id', sessionId)
            .maybeSingle();
        let result;
        if (existing) {
            const { data, error } = await supabase
                .from('employee_staging')
                .update(payload)
                .eq('session_id', sessionId)
                .select()
                .single();
            if (error)
                throw new common_1.BadRequestException(error.message);
            result = data;
        }
        else {
            const { data, error } = await supabase
                .from('employee_staging')
                .insert({
                profile_id: crypto.randomUUID(),
                session_id: sessionId,
                ...payload,
            })
                .select()
                .single();
            if (error)
                throw new common_1.BadRequestException(error.message);
            result = data;
        }
        const { data: profileItems } = await supabase
            .from('onboarding_items')
            .select('onboarding_item_id, template_items!inner(tab_category)')
            .eq('session_id', sessionId)
            .eq('template_items.tab_category', 'profile');
        if (profileItems && profileItems.length > 0) {
            await supabase
                .from('onboarding_items')
                .update({ status: 'confirmed' })
                .in('onboarding_item_id', profileItems.map(i => i.onboarding_item_id));
        }
        await this.recalculateProgress(sessionId);
        const ctx = await this.getSessionContext(sessionId);
        if (ctx) {
            this.auditService.log(`PROFILE_SAVE: session ${sessionId}`, ctx.accountId, ctx.companyId).catch(err => this.logger.error('Failed to write audit log in saveProfile', err));
        }
        return result;
    }
    async submitForReview(sessionId, applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data: reviewItems, error: reviewItemsError } = await supabase
            .from('onboarding_items')
            .select('status, template_items(tab_category, is_required)')
            .eq('session_id', sessionId);
        if (reviewItemsError)
            throw new common_1.BadRequestException(reviewItemsError.message);
        const checklistTabs = new Set(['profile', 'documents', 'hr_forms', 'tasks', 'equipment']);
        const doneStatuses = new Set(['approved', 'confirmed', 'issued']);
        const requiredIncomplete = (reviewItems ?? []).filter((item) => {
            const tabCategory = String(item?.template_items?.tab_category ?? '').toLowerCase();
            const isRequired = Boolean(item?.template_items?.is_required);
            const status = String(item?.status ?? '').toLowerCase();
            return checklistTabs.has(tabCategory) && isRequired && !doneStatuses.has(status);
        });
        if (requiredIncomplete.length > 0) {
            throw new common_1.BadRequestException('Please complete all required onboarding items before submitting for final review.');
        }
        const equipmentIncomplete = (reviewItems ?? []).filter((item) => {
            const tabCategory = String(item?.template_items?.tab_category ?? '').toLowerCase();
            const status = String(item?.status ?? '').toLowerCase();
            return tabCategory === 'equipment' && !['approved', 'issued'].includes(status);
        });
        if (equipmentIncomplete.length > 0) {
            throw new common_1.BadRequestException('Please complete the Equipment step first before submitting for final review.');
        }
        if (applicantId) {
            const { data: sessionRow } = await supabase
                .from('onboarding_sessions')
                .select('template_id')
                .eq('session_id', sessionId)
                .maybeSingle();
            if (sessionRow?.template_id) {
                const { data: activeVideos } = await supabase
                    .from('onboarding_training_videos')
                    .select('video_id')
                    .eq('template_id', sessionRow.template_id)
                    .eq('is_active', true);
                if (activeVideos && activeVideos.length > 0) {
                    const videoIds = activeVideos.map((v) => v.video_id);
                    const { data: completedRows } = await supabase
                        .from('applicant_video_progress')
                        .select('video_id')
                        .eq('applicant_id', applicantId)
                        .eq('is_completed', true)
                        .in('video_id', videoIds);
                    const completedIds = new Set((completedRows ?? []).map((r) => r.video_id));
                    const incomplete = videoIds.filter((id) => !completedIds.has(id));
                    if (incomplete.length > 0) {
                        throw new common_1.BadRequestException(`Please finish all required training videos before submitting. ${incomplete.length} video(s) not yet completed.`);
                    }
                }
            }
        }
        await supabase
            .from('onboarding_sessions')
            .update({ status: 'for-review' })
            .eq('session_id', sessionId);
        const ctx = await this.getSessionContext(sessionId);
        if (ctx) {
            this.auditService.log(`ONBOARDING_SUBMITTED_FOR_REVIEW: session ${sessionId}`, ctx.accountId, ctx.companyId).catch(err => this.logger.error('Failed to write audit log in submitForReview', err));
            this.notificationsService.notifyAllHRInCompany(ctx.companyId, {
                type: 'ONBOARDING_SUBMITTED',
                title: 'New Onboarding Submission',
                message: `${ctx.employeeName} has submitted their onboarding for review.`,
                metadata: { session_id: sessionId, employee_id: ctx.accountId },
            }).catch(err => this.logger.error('Failed to notify HR in submitForReview', err));
        }
        this.logger.log(`Session ${sessionId} submitted for review`);
        return { message: 'Onboarding submitted for HR review', session_id: sessionId, status: 'for-review' };
    }
    async getAllOnboardingSessions(includeDeclined = false) {
        const supabase = this.supabaseService.getClient();
        const BASE_COLS = 'session_id,account_id,template_id,assigned_position,assigned_department,status,progress_percentage,deadline_date,completed_at';
        const COLS_WITH_OFFER = `${BASE_COLS},offer_status`;
        const runWith = () => {
            let q = supabase
                .from('onboarding_sessions')
                .select(COLS_WITH_OFFER)
                .in('status', ['not-started', 'in-progress', 'overdue', 'for-review'])
                .order('deadline_date', { ascending: true });
            if (!includeDeclined)
                q = q.neq('offer_status', 'declined');
            return q;
        };
        const runWithout = () => supabase
            .from('onboarding_sessions')
            .select(BASE_COLS)
            .in('status', ['not-started', 'in-progress', 'overdue', 'for-review'])
            .order('deadline_date', { ascending: true });
        const first = await runWith();
        let sessions = first.data;
        let error = first.error;
        if (error && /offer_status/i.test(error.message)) {
            this.logger.warn(`[getAllOnboardingSessions] offer_status column missing — falling back. Run one_time_offer_onboarding_fix.sql to enable declined-filtering.`);
            const second = await runWithout();
            sessions = second.data;
            error = second.error;
        }
        if (error)
            throw new common_1.BadRequestException(error.message);
        const sessionRows = sessions ?? [];
        if (sessionRows.length === 0)
            return [];
        const accountIds = [...new Set(sessionRows.map((s) => s.account_id).filter(Boolean))];
        const templateIds = [...new Set(sessionRows.map((s) => s.template_id).filter(Boolean))];
        let users = [];
        let applicants = [];
        let templates = [];
        if (accountIds.length > 0) {
            const { data: userRows, error: userError } = await supabase
                .from('user_profile')
                .select('user_id, first_name, last_name')
                .in('user_id', accountIds);
            if (userError)
                this.logger.warn(`[getAllOnboardingSessions] user_profile lookup failed: ${userError.message}`);
            users = (userRows ?? []);
            const { data: applicantRows, error: applicantError } = await supabase
                .from('applicant_profile')
                .select('applicant_id, first_name, last_name')
                .in('applicant_id', accountIds);
            if (applicantError)
                this.logger.warn(`[getAllOnboardingSessions] applicant_profile lookup failed: ${applicantError.message}`);
            applicants = (applicantRows ?? []);
        }
        if (templateIds.length > 0) {
            const { data: templateRows, error: templateError } = await supabase
                .from('onboarding_templates')
                .select('template_id, name')
                .in('template_id', templateIds);
            if (templateError)
                this.logger.warn(`[getAllOnboardingSessions] onboarding_templates lookup failed: ${templateError.message}`);
            templates = (templateRows ?? []);
        }
        const userNameById = new Map();
        for (const u of users) {
            const fullName = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim();
            if (fullName)
                userNameById.set(u.user_id, fullName);
        }
        const applicantNameById = new Map();
        for (const a of applicants) {
            const fullName = `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim();
            if (fullName)
                applicantNameById.set(a.applicant_id, fullName);
        }
        const templateNameById = new Map();
        for (const t of templates) {
            templateNameById.set(t.template_id, t.name ?? null);
        }
        return sessionRows.map((s) => ({
            ...s,
            employee_name: userNameById.get(s.account_id) ?? applicantNameById.get(s.account_id) ?? null,
            template_name: templateNameById.get(s.template_id) ?? null,
        }));
    }
    async getSessionById(sessionId) {
        const supabase = this.supabaseService.getClient();
        const { data: session } = await supabase
            .from('onboarding_sessions')
            .select('account_id')
            .eq('session_id', sessionId)
            .single();
        if (!session)
            throw new common_1.NotFoundException('Session not found.');
        return this.getMySession(session.account_id, sessionId);
    }
    async updateItemStatus(onboardingItemId, dto, authorId) {
        const supabase = this.supabaseService.getClient();
        const { data: item, error } = await supabase
            .from('onboarding_items')
            .select('onboarding_item_id, session_id, template_item_id, template_items(title, tab_category)')
            .eq('onboarding_item_id', onboardingItemId)
            .single();
        if (error || !item)
            throw new common_1.NotFoundException('Onboarding item not found.');
        const { error: itemUpdateError } = await supabase
            .from('onboarding_items')
            .update({ status: dto.status })
            .eq('onboarding_item_id', onboardingItemId);
        if (itemUpdateError)
            throw new common_1.InternalServerErrorException(itemUpdateError.message);
        const tabCategory = item.template_items?.tab_category;
        if (tabCategory === 'profile' && dto.status === 'rejected') {
            const { error: stagingResetError } = await supabase
                .from('employee_staging')
                .update({ status: 'pending' })
                .eq('session_id', item.session_id);
            if (stagingResetError)
                throw new common_1.InternalServerErrorException(stagingResetError.message);
        }
        const tabTagFromCategory = (() => {
            if (tabCategory === 'profile')
                return 'Profile';
            if (tabCategory === 'documents')
                return 'Documents';
            if (tabCategory === 'tasks')
                return 'Tasks';
            if (tabCategory === 'equipment')
                return 'Equipment';
            if (tabCategory === 'hr_forms')
                return 'Forms';
            return 'Documents';
        })();
        if (dto.remarks) {
            const { error: remarkInsertError } = await supabase.from('onboarding_remarks').insert({
                remark_id: crypto.randomUUID(),
                session_id: item.session_id,
                author_id: authorId ?? crypto.randomUUID(),
                tab_tag: dto.tab_tag ?? tabTagFromCategory,
                remark_text: dto.remarks,
                created_at: new Date().toISOString(),
            });
            if (remarkInsertError)
                throw new common_1.InternalServerErrorException(remarkInsertError.message);
        }
        await this.recalculateProgress(item.session_id);
        if (dto.status === 'approved' || dto.status === 'rejected') {
            const ctx = await this.getSessionContext(item.session_id);
            if (ctx) {
                const itemTitle = item.template_items?.title ?? 'Onboarding item';
                this.auditService.log(`ONBOARDING_ITEM_REVIEWED (${dto.status}): item ${onboardingItemId}`, authorId ?? ctx.accountId, ctx.companyId, ctx.accountId).catch(err => this.logger.error('Failed to write audit log in updateItemStatus', err));
                this.notificationsService.createNotification({
                    userId: ctx.accountId,
                    companyId: ctx.companyId,
                    type: 'ONBOARDING_ITEM_REVIEWED',
                    title: dto.status === 'approved' ? 'Item Approved' : 'Item Rejected',
                    message: `Your onboarding item "${itemTitle}" has been ${dto.status}.${dto.remarks ? ` Note: ${dto.remarks}` : ''}`,
                    metadata: {
                        onboarding_item_id: onboardingItemId,
                        status: dto.status,
                        remarks: dto.remarks ?? null,
                    },
                }).catch(err => this.logger.error('Failed to create notification in updateItemStatus', err));
                if (ctx.employeeEmail) {
                    this.mailService.sendOnboardingItemReviewedEmail({
                        to: ctx.employeeEmail,
                        employeeName: ctx.employeeName,
                        itemTitle,
                        tabCategory: tabCategory ?? 'Onboarding',
                        status: dto.status,
                        remarks: dto.remarks ?? null,
                    }).catch(err => this.logger.error('Failed to send item review email in updateItemStatus', err));
                }
            }
        }
        this.logger.log(`Item ${onboardingItemId} updated to: ${dto.status}`);
        return { message: `Item marked as ${dto.status}`, onboarding_item_id: onboardingItemId, status: dto.status };
    }
    async addRemark(dto, authorId) {
        const supabase = this.supabaseService.getClient();
        const trimmedTabTag = dto.tab_tag?.trim();
        if (!trimmedTabTag)
            throw new common_1.BadRequestException('tab_tag is required');
        if (!authorId)
            throw new common_1.BadRequestException('Missing author information');
        const tabTagCandidates = this.getRemarkTabTagCandidates(trimmedTabTag);
        let lastErrorMessage = 'Unknown error';
        for (const candidateTabTag of tabTagCandidates) {
            const { data, error } = await supabase
                .from('onboarding_remarks')
                .insert({
                remark_id: crypto.randomUUID(),
                session_id: dto.session_id,
                author_id: authorId,
                tab_tag: candidateTabTag,
                remark_text: dto.remark_text,
                created_at: new Date().toISOString(),
            })
                .select()
                .single();
            if (!error)
                return data;
            lastErrorMessage = error.message;
            const maybeTagMismatch = /tab_tag|enum|check constraint|invalid input value/i.test(lastErrorMessage);
            if (!maybeTagMismatch) {
                throw new common_1.BadRequestException(lastErrorMessage);
            }
        }
        throw new common_1.BadRequestException(lastErrorMessage);
    }
    async approveSession(sessionId, hrUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: sessionRow, error: sessionError } = await supabase
            .from('onboarding_sessions')
            .select('account_id, status')
            .eq('session_id', sessionId)
            .maybeSingle();
        if (sessionError)
            throw new common_1.InternalServerErrorException(sessionError.message);
        if (!sessionRow)
            throw new common_1.NotFoundException('Session not found.');
        if (hrUserId && String(sessionRow.account_id ?? '') === hrUserId) {
            throw new common_1.ForbiddenException('You cannot review your own onboarding session.');
        }
        if (sessionRow.status !== 'for-review') {
            throw new common_1.BadRequestException('Only sessions in "for-review" status can be approved.');
        }
        const { data: reviewItems, error: reviewItemsError } = await supabase
            .from('onboarding_items')
            .select('status, template_items(tab_category)')
            .eq('session_id', sessionId);
        if (reviewItemsError)
            throw new common_1.InternalServerErrorException(reviewItemsError.message);
        const pendingTasks = (reviewItems ?? []).filter((item) => {
            const tabCategory = String(item?.template_items?.tab_category ?? '').toLowerCase();
            const status = String(item?.status ?? '').toLowerCase();
            return tabCategory === 'tasks' && !['approved', 'confirmed'].includes(status);
        });
        const pendingEquipment = (reviewItems ?? []).filter((item) => {
            const tabCategory = String(item?.template_items?.tab_category ?? '').toLowerCase();
            const status = String(item?.status ?? '').toLowerCase();
            return tabCategory === 'equipment' && !['issued', 'approved'].includes(status);
        });
        if (pendingTasks.length > 0 || pendingEquipment.length > 0) {
            throw new common_1.BadRequestException(`Cannot approve onboarding yet. Pending tasks: ${pendingTasks.length}. Pending equipment items: ${pendingEquipment.length}.`);
        }
        const approvalDate = getManilaDateKey();
        const { error: approveSessionError } = await supabase
            .from('onboarding_sessions')
            .update({ status: 'approved', completed_at: new Date().toISOString() })
            .eq('session_id', sessionId);
        if (approveSessionError)
            throw new common_1.InternalServerErrorException(approveSessionError.message);
        const accountId = sessionRow?.account_id;
        let resolvedUserId = accountId;
        if (accountId) {
            const { data: existingProfile } = await supabase
                .from('user_profile')
                .select('user_id')
                .eq('user_id', accountId)
                .maybeSingle();
            if (!existingProfile) {
                try {
                    const [{ data: applicant }, { data: staging }] = await Promise.all([
                        supabase.from('applicant_profile').select('email, company_id').eq('applicant_id', accountId).maybeSingle(),
                        supabase.from('employee_staging').select('*').eq('session_id', sessionId).maybeSingle(),
                    ]);
                    if (applicant) {
                        const newUserId = crypto.randomUUID();
                        const employeeCode = `EMP-${Math.floor(1000000 + Math.random() * 9000000)}`;
                        const base = `${(staging?.first_name ?? 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}.${(staging?.last_name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                        const username = `${base}${Math.floor(100 + Math.random() * 900)}`;
                        const { data: defaultRole } = await supabase
                            .from('role')
                            .select('role_id')
                            .eq('company_id', applicant.company_id)
                            .ilike('role_name', '%employee%')
                            .limit(1)
                            .maybeSingle();
                        const loginEmail = applicant.email;
                        const personalEmail = staging?.email_address ?? applicant.email;
                        const stagingDepartmentId = typeof staging?.department_id === 'string'
                            ? staging.department_id
                            : null;
                        const { data: createdProfile, error: userInsertError } = await supabase
                            .from('user_profile')
                            .insert({
                            user_id: newUserId,
                            email: loginEmail,
                            personal_email: personalEmail,
                            first_name: staging?.first_name ?? '',
                            middle_name: staging?.middle_name ?? null,
                            last_name: staging?.last_name ?? '',
                            username,
                            company_id: applicant.company_id,
                            employee_id: employeeCode,
                            account_status: 'Active',
                            start_date: approvalDate,
                            ...(defaultRole ? { role_id: defaultRole.role_id } : {}),
                            ...(staging?.phone_number ? { phone_number: staging.phone_number } : {}),
                            ...(staging?.complete_address ? { complete_address: staging.complete_address } : {}),
                            ...(staging?.date_of_birth ? { date_of_birth: staging.date_of_birth } : {}),
                            ...(staging?.place_of_birth ? { place_of_birth: staging.place_of_birth } : {}),
                            ...(staging?.nationality ? { nationality: staging.nationality } : {}),
                            ...(staging?.civil_status ? { civil_status: staging.civil_status } : {}),
                            ...(stagingDepartmentId ? { department_id: stagingDepartmentId } : {}),
                        })
                            .select('department_id')
                            .single();
                        if (userInsertError)
                            throw new common_1.InternalServerErrorException(userInsertError.message);
                        const inheritedDepartmentId = stagingDepartmentId ??
                            createdProfile?.department_id ??
                            null;
                        try {
                            const assignment = await this.timekeepingService.assignInitialScheduleForEmployee({
                                companyId: applicant.company_id,
                                employeeId: employeeCode,
                                departmentId: inheritedDepartmentId,
                                effectiveDate: approvalDate,
                                updatedByName: null,
                            });
                            this.logger.log(`[approveSession] Initial schedule assignment for ${employeeCode}: ${assignment.source}`);
                        }
                        catch (schedErr) {
                            this.logger.warn(`[approveSession] Could not assign initial schedule: ${schedErr?.message}`);
                        }
                        const { error: relinkSessionError } = await supabase
                            .from('onboarding_sessions')
                            .update({ account_id: newUserId })
                            .eq('session_id', sessionId);
                        if (relinkSessionError)
                            throw new common_1.InternalServerErrorException(relinkSessionError.message);
                        resolvedUserId = newUserId;
                        const { error: applicantStatusError } = await supabase
                            .from('applicant_profile')
                            .update({ status: 'converted_employee' })
                            .eq('applicant_id', accountId);
                        if (applicantStatusError)
                            throw new common_1.InternalServerErrorException(applicantStatusError.message);
                        const rawToken = crypto.randomBytes(32).toString('hex');
                        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
                        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
                        const { error: userInviteError } = await supabase
                            .from('user_invites')
                            .insert({ invite_id: crypto.randomUUID(), user_id: newUserId, token_hash: tokenHash, expires_at: expiresAt });
                        if (userInviteError)
                            throw new common_1.InternalServerErrorException(userInviteError.message);
                        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
                        const inviteLink = `${appUrl}/set-password?token=${rawToken}`;
                        try {
                            await this.mailService.sendInvite(loginEmail, inviteLink);
                        }
                        catch {
                            this.logger.log(`[approveSession] invite link for ${loginEmail}: ${inviteLink}`);
                        }
                    }
                }
                catch (provisionErr) {
                    this.logger.error(`[approveSession] Failed to provision employee account: ${provisionErr?.message}`);
                }
            }
        }
        const ctx = await this.getSessionContext(sessionId);
        if (ctx) {
            this.auditService.log(`ONBOARDING_SESSION_APPROVED: session ${sessionId}`, hrUserId ?? ctx.accountId, ctx.companyId, ctx.accountId).catch(err => this.logger.error('Failed to write audit log in approveSession', err));
            this.notificationsService.createNotification({
                userId: ctx.accountId,
                companyId: ctx.companyId,
                type: 'ONBOARDING_APPROVED',
                title: 'Onboarding Complete',
                message: 'Your onboarding has been approved. Welcome to the team!',
                metadata: { session_id: sessionId },
            }).catch(err => this.logger.error('Failed to create notification in approveSession', err));
            this.mailService.sendOnboardingApprovedEmail({
                to: ctx.employeeEmail,
                employeeName: ctx.employeeName,
            }).catch(err => this.logger.error('Failed to send onboarding approved email in approveSession', err));
        }
        try {
            if (resolvedUserId) {
                const { data: staging } = await supabase
                    .from('employee_staging')
                    .select('*')
                    .eq('session_id', sessionId)
                    .maybeSingle();
                if (staging) {
                    const profileUpdate = {};
                    const { data: profileForSync } = await supabase
                        .from('user_profile')
                        .select('start_date')
                        .eq('user_id', resolvedUserId)
                        .maybeSingle();
                    if (!profileForSync?.start_date)
                        profileUpdate.start_date = approvalDate;
                    if (staging.email_address != null)
                        profileUpdate.personal_email = staging.email_address;
                    if (staging.middle_name != null)
                        profileUpdate.middle_name = staging.middle_name;
                    if (staging.phone_number != null)
                        profileUpdate.phone_number = staging.phone_number;
                    if (staging.complete_address != null)
                        profileUpdate.complete_address = staging.complete_address;
                    if (staging.date_of_birth != null)
                        profileUpdate.date_of_birth = staging.date_of_birth;
                    if (staging.place_of_birth != null)
                        profileUpdate.place_of_birth = staging.place_of_birth;
                    if (staging.nationality != null)
                        profileUpdate.nationality = staging.nationality;
                    if (staging.civil_status != null)
                        profileUpdate.civil_status = staging.civil_status;
                    if (Object.keys(profileUpdate).length > 0) {
                        const { error: profileSyncError } = await supabase
                            .from('user_profile')
                            .update(profileUpdate)
                            .eq('user_id', resolvedUserId);
                        if (profileSyncError)
                            throw new common_1.InternalServerErrorException(profileSyncError.message);
                    }
                }
                const { data: sessionItems } = await supabase
                    .from('onboarding_items')
                    .select('onboarding_item_id, template_items!inner(tab_category, title)')
                    .eq('session_id', sessionId)
                    .eq('template_items.tab_category', 'documents');
                if (sessionItems && sessionItems.length > 0) {
                    const itemIds = sessionItems.map((i) => i.onboarding_item_id);
                    const { data: docs } = await supabase
                        .from('onboarding_documents')
                        .select('*')
                        .in('onboarding_item_id', itemIds)
                        .eq('is_proof_of_receipt', false);
                    if (docs && docs.length > 0) {
                        const docRows = [];
                        for (const doc of docs) {
                            const item = sessionItems.find((i) => i.onboarding_item_id === doc.onboarding_item_id);
                            const docType = this.normalizeDocType(item?.template_items?.title || 'onboarding-document');
                            let employeeFilePath = doc.file_path || doc.file_url;
                            if (doc.file_path) {
                                try {
                                    const destPath = `${resolvedUserId}/${Date.now()}_${doc.file_name}`;
                                    const { data: fileData, error: dlErr } = await supabase.storage
                                        .from('onboarding-documents')
                                        .download(doc.file_path);
                                    if (!dlErr && fileData) {
                                        const { error: upErr } = await supabase.storage
                                            .from('employee-documents')
                                            .upload(destPath, fileData, { contentType: doc.file_type || 'application/octet-stream', upsert: true });
                                        if (!upErr)
                                            employeeFilePath = destPath;
                                    }
                                }
                                catch {
                                }
                            }
                            docRows.push({
                                id: crypto.randomUUID(),
                                user_id: resolvedUserId,
                                document_type: docType,
                                file_path: employeeFilePath,
                                file_name: doc.file_name,
                                file_size: doc.file_size_bytes,
                                status: 'approved',
                                reviewed_at: new Date().toISOString(),
                                uploaded_at: doc.uploaded_at || new Date().toISOString(),
                            });
                        }
                        await supabase
                            .from('employee_documents')
                            .upsert(docRows, { onConflict: 'file_path', ignoreDuplicates: true });
                    }
                }
            }
        }
        catch (syncErr) {
            this.logger.error(`[approveSession] Failed to sync profile/docs: ${syncErr?.message}`);
        }
        return { message: 'Onboarding approved', session_id: sessionId, status: 'approved' };
    }
    async rejectSession(sessionId, reason, hrUserId) {
        const supabase = this.supabaseService.getClient();
        const trimmedReason = reason?.trim();
        if (!trimmedReason)
            throw new common_1.BadRequestException('Rejection reason is required.');
        const { data: sessionRow, error: sessionError } = await supabase
            .from('onboarding_sessions')
            .select('account_id, status')
            .eq('session_id', sessionId)
            .maybeSingle();
        if (sessionError)
            throw new common_1.InternalServerErrorException(sessionError.message);
        if (!sessionRow)
            throw new common_1.NotFoundException('Session not found.');
        if (hrUserId && String(sessionRow.account_id ?? '') === hrUserId) {
            throw new common_1.ForbiddenException('You cannot review your own onboarding session.');
        }
        if (sessionRow.status !== 'for-review') {
            throw new common_1.BadRequestException('Only sessions in "for-review" status can be rejected.');
        }
        const { error: sessionUpdateError } = await supabase
            .from('onboarding_sessions')
            .update({ status: 'in-progress', completed_at: null })
            .eq('session_id', sessionId);
        if (sessionUpdateError)
            throw new common_1.InternalServerErrorException(sessionUpdateError.message);
        const { error: remarkInsertError } = await supabase
            .from('onboarding_remarks')
            .insert({
            remark_id: crypto.randomUUID(),
            session_id: sessionId,
            author_id: hrUserId ?? crypto.randomUUID(),
            tab_tag: 'Profile',
            remark_text: `Final onboarding review rejected: ${trimmedReason}`,
            created_at: new Date().toISOString(),
        });
        if (remarkInsertError)
            throw new common_1.InternalServerErrorException(remarkInsertError.message);
        const ctx = await this.getSessionContext(sessionId);
        if (ctx) {
            this.auditService.log(`ONBOARDING_SESSION_REJECTED: session ${sessionId}`, hrUserId ?? ctx.accountId, ctx.companyId, ctx.accountId).catch(err => this.logger.error('Failed to write audit log in rejectSession', err));
            this.notificationsService.createNotification({
                userId: ctx.accountId,
                companyId: ctx.companyId,
                type: 'ONBOARDING_REJECTED',
                title: 'Onboarding Needs Revisions',
                message: `HR requested updates before approval. Reason: ${trimmedReason}`,
                metadata: { session_id: sessionId, reason: trimmedReason },
            }).catch(err => this.logger.error('Failed to create notification in rejectSession', err));
            if (ctx.employeeEmail) {
                this.mailService.sendOnboardingRejectedEmail({
                    to: ctx.employeeEmail,
                    employeeName: ctx.employeeName,
                    reason: trimmedReason,
                }).catch(err => this.logger.error('Failed to send onboarding rejected email in rejectSession', err));
            }
        }
        return {
            message: 'Session rejected and returned to applicant for corrections.',
            session_id: sessionId,
            status: 'in-progress',
            reason: trimmedReason,
        };
    }
    async createTemplate(dto) {
        const supabase = this.supabaseService.getClient();
        const { data: position } = await supabase
            .from('job_positions')
            .select('position_id')
            .eq('position_id', dto.position_id)
            .maybeSingle();
        if (!position)
            throw new common_1.BadRequestException('Invalid position_id: position does not exist');
        const { data: dept } = await supabase
            .from('department')
            .select('department_id')
            .eq('department_id', dto.department_id)
            .maybeSingle();
        if (!dept)
            throw new common_1.BadRequestException('Invalid department_id: department does not exist');
        const templateId = crypto.randomUUID();
        const { error: templateErr } = await supabase
            .from('onboarding_templates')
            .insert({
            template_id: templateId,
            name: dto.name,
            department_id: dto.department_id,
            position_id: dto.position_id,
            default_deadline_days: dto.default_deadline_days,
            created_at: new Date().toISOString(),
        });
        if (templateErr)
            throw new common_1.BadRequestException(templateErr.message);
        const itemRows = dto.items.map(item => ({
            item_id: crypto.randomUUID(),
            template_id: templateId,
            type: item.type,
            tab_category: item.tab_category,
            title: item.title,
            description: item.description || null,
            rich_content: item.rich_content || null,
            is_required: item.is_required,
        }));
        if (itemRows.length > 0) {
            const { error: itemsErr } = await supabase
                .from('template_items')
                .insert(itemRows);
            if (itemsErr)
                throw new common_1.BadRequestException(itemsErr.message);
        }
        this.logger.log(`Template created: ${dto.name}`);
        return { message: 'Template created', template_id: templateId, name: dto.name, items_count: itemRows.length };
    }
    async getAllTemplates() {
        const supabase = this.supabaseService.getClient();
        const { data: templates, error } = await supabase
            .from('onboarding_templates')
            .select(`
        template_id,
        name,
        department_id,
        position_id,
        default_deadline_days,
        created_at,
        template_items (
          item_id,
          type,
          tab_category,
          title,
          description,
          is_required
        )
      `)
            .order('created_at', { ascending: false });
        if (error)
            throw new common_1.BadRequestException(error.message);
        const enriched = [];
        for (const t of templates || []) {
            const { data: pos } = await supabase
                .from('job_positions')
                .select('position_name')
                .eq('position_id', t.position_id)
                .maybeSingle();
            const { data: department } = await supabase
                .from('department')
                .select('department_name')
                .eq('department_id', t.department_id)
                .maybeSingle();
            enriched.push({
                ...t,
                position_name: pos?.position_name || null,
                department_name: department?.department_name || null,
            });
        }
        return enriched;
    }
    async assignTemplate(dto) {
        const supabase = this.supabaseService.getClient();
        const sessionId = crypto.randomUUID();
        const { error: sessionErr } = await supabase
            .from('onboarding_sessions')
            .insert({
            session_id: sessionId,
            account_id: dto.account_id,
            template_id: dto.template_id,
            assigned_position: dto.assigned_position,
            assigned_department: dto.assigned_department,
            status: 'not-started',
            progress_percentage: 0,
            deadline_date: dto.deadline_date,
        });
        if (sessionErr)
            throw new common_1.BadRequestException(sessionErr.message);
        const { data: templateItems } = await supabase
            .from('template_items')
            .select('*')
            .eq('template_id', dto.template_id);
        if (templateItems && templateItems.length > 0) {
            const onboardingItems = templateItems.map(ti => ({
                onboarding_item_id: crypto.randomUUID(),
                session_id: sessionId,
                template_item_id: ti.item_id,
                status: 'pending',
                is_requested: null,
                delivery_method: null,
            }));
            const { error: itemsErr } = await supabase
                .from('onboarding_items')
                .insert(onboardingItems);
            if (itemsErr)
                throw new common_1.BadRequestException(itemsErr.message);
        }
        this.logger.log(`Template ${dto.template_id} assigned to ${dto.account_id}`);
        return { message: 'Template assigned', session_id: sessionId };
    }
    async requestEquipment(onboardingItemId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data: item, error } = await supabase
            .from('onboarding_items')
            .select('onboarding_item_id, session_id')
            .eq('onboarding_item_id', onboardingItemId)
            .single();
        if (error || !item)
            throw new common_1.NotFoundException('Onboarding item not found.');
        await supabase
            .from('onboarding_items')
            .update({ is_requested: dto.is_requested, delivery_method: dto.delivery_method, delivery_address: dto.delivery_address ?? null, status: 'submitted' })
            .eq('onboarding_item_id', onboardingItemId);
        await this.recalculateProgress(item.session_id);
        return { message: 'Equipment requested', onboarding_item_id: onboardingItemId };
    }
    async getAllPositions() {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('job_positions')
            .select('position_id, position_name, department_id, created_at')
            .order('position_name', { ascending: true });
        if (error)
            throw new common_1.BadRequestException(error.message);
        const enriched = [];
        for (const p of data || []) {
            const { data: dept } = await supabase
                .from('department')
                .select('department_name')
                .eq('department_id', p.department_id)
                .maybeSingle();
            enriched.push({
                ...p,
                department_name: dept?.department_name || null,
            });
        }
        return enriched;
    }
    async createPosition(dto) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('job_positions')
            .insert({
            position_id: crypto.randomUUID(),
            department_id: dto.department_id,
            position_name: dto.position_name,
            created_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async addTemplateItem(templateId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('template_items')
            .insert({
            item_id: crypto.randomUUID(),
            template_id: templateId,
            type: dto.type,
            tab_category: dto.tab_category,
            title: dto.title,
            description: dto.description || null,
            is_required: dto.is_required,
            rich_content: dto.rich_content || null,
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        const { data: activeSessions } = await supabase
            .from('onboarding_sessions')
            .select('session_id')
            .eq('template_id', templateId)
            .neq('status', 'approved');
        if (activeSessions && activeSessions.length > 0) {
            await supabase.from('onboarding_items').insert(activeSessions.map(s => ({
                onboarding_item_id: crypto.randomUUID(),
                session_id: s.session_id,
                template_item_id: data.item_id,
                status: 'pending',
                is_requested: null,
                delivery_method: null,
            })));
            for (const s of activeSessions) {
                await this.recalculateProgress(s.session_id);
            }
        }
        return data;
    }
    async deleteTemplateItem(itemId) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('template_items')
            .delete()
            .eq('item_id', itemId);
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    async updateTemplateItem(itemId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('template_items')
            .update(dto)
            .eq('item_id', itemId)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (dto.is_required !== undefined) {
            const { data: activeSessions } = await supabase
                .from('onboarding_sessions')
                .select('session_id')
                .eq('template_id', data.template_id)
                .neq('status', 'approved');
            for (const s of activeSessions || []) {
                await this.recalculateProgress(s.session_id);
            }
        }
        return data;
    }
    async getDepartments() {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('department')
            .select('department_id, department_name, company_id')
            .order('department_name', { ascending: true });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async updateSessionDeadline(sessionId, deadlineDate) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('onboarding_sessions')
            .update({ deadline_date: deadlineDate })
            .eq('session_id', sessionId);
        if (error)
            throw new common_1.BadRequestException(error.message);
        await this.recalculateProgress(sessionId);
        return { session_id: sessionId, deadline_date: deadlineDate };
    }
    async recalculateProgress(sessionId) {
        const supabase = this.supabaseService.getClient();
        const { data: items } = await supabase
            .from('onboarding_items')
            .select(`
        status,
        template_items!inner ( is_required, tab_category )
      `)
            .eq('session_id', sessionId);
        if (!items || items.length === 0)
            return;
        const trackable = items.filter((i) => i.template_items.tab_category !== 'welcome');
        const required = trackable.filter((i) => i.template_items.is_required);
        const completed = required.filter((i) => ['approved', 'confirmed', 'issued'].includes(i.status));
        const percentage = required.length > 0
            ? Math.round((completed.length / required.length) * 100)
            : 0;
        const { data: session } = await supabase
            .from('onboarding_sessions')
            .select('status, deadline_date')
            .eq('session_id', sessionId)
            .single();
        const update = { progress_percentage: percentage };
        if (session && !['for-review', 'approved'].includes(session.status)) {
            const isOverdue = new Date(session.deadline_date) < new Date();
            if (isOverdue) {
                update.status = 'overdue';
            }
            else if (percentage > 0) {
                update.status = 'in-progress';
            }
            else {
                update.status = 'not-started';
            }
        }
        await supabase
            .from('onboarding_sessions')
            .update(update)
            .eq('session_id', sessionId);
    }
    async createOnboardingRecord(params) {
        const supabase = this.supabaseService.getClient();
        const { data: existing } = await supabase
            .from('onboarding_submissions')
            .select('submission_id, start_date')
            .eq('application_id', params.applicationId)
            .maybeSingle();
        const hireDate = getManilaDateKey();
        if (existing) {
            if (!existing.start_date) {
                const { error: backfillError } = await supabase
                    .from('onboarding_submissions')
                    .update({ start_date: hireDate })
                    .eq('submission_id', existing.submission_id);
                if (backfillError)
                    throw new common_1.InternalServerErrorException(backfillError.message);
            }
            return existing;
        }
        const { data: applicant } = await supabase
            .from('applicant_profile')
            .select('first_name, last_name, phone_number')
            .eq('applicant_id', params.applicantId)
            .maybeSingle();
        const { data, error } = await supabase
            .from('onboarding_submissions')
            .insert({
            applicant_id: params.applicantId,
            application_id: params.applicationId,
            job_posting_id: params.jobPostingId,
            company_id: params.companyId,
            status: 'pending',
            first_name: applicant?.first_name ?? null,
            last_name: applicant?.last_name ?? null,
            phone: applicant?.phone_number ?? null,
            start_date: hireDate,
        })
            .select('submission_id')
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async getMyOnboarding(applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('onboarding_submissions')
            .select('*, job_postings ( title )')
            .eq('applicant_id', applicantId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data ?? null;
    }
    async saveOnboarding(applicantId, body) {
        const supabase = this.supabaseService.getClient();
        const { data: submission, error: findErr } = await supabase
            .from('onboarding_submissions')
            .select('submission_id, status')
            .eq('applicant_id', applicantId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (findErr)
            throw new common_1.InternalServerErrorException(findErr.message);
        if (!submission)
            throw new common_1.NotFoundException('No onboarding record found.');
        if (submission.status === 'approved')
            throw new common_1.BadRequestException('Onboarding has already been approved.');
        if (submission.status === 'submitted')
            throw new common_1.BadRequestException('Onboarding is under review. Wait for HR feedback before editing.');
        const allowed = ['first_name', 'last_name', 'phone', 'address', 'date_of_birth', 'nationality', 'civil_status',
            'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship', 'preferred_username', 'department_id', 'start_date'];
        const patch = {};
        for (const key of allowed) {
            if (body[key] !== undefined)
                patch[key] = body[key];
        }
        for (const key of ['first_name', 'last_name']) {
            if (patch[key] !== undefined)
                patch[key] = (0, common_2.normalizeNamePart)(patch[key]);
        }
        if (Object.keys(patch).length === 0)
            return { message: 'Nothing to update' };
        const { data, error } = await supabase
            .from('onboarding_submissions')
            .update(patch)
            .eq('submission_id', submission.submission_id)
            .select('*')
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async submitOnboarding(applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data: submission, error: findErr } = await supabase
            .from('onboarding_submissions')
            .select('*')
            .eq('applicant_id', applicantId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
        if (findErr)
            throw new common_1.InternalServerErrorException(findErr.message);
        if (!submission)
            throw new common_1.NotFoundException('No onboarding record found.');
        if (submission.status === 'approved')
            throw new common_1.BadRequestException('Onboarding has already been approved.');
        if (submission.status === 'submitted')
            throw new common_1.BadRequestException('Onboarding is already submitted and under review.');
        const REQUIRED = ['first_name', 'last_name', 'phone', 'address', 'date_of_birth', 'nationality', 'civil_status',
            'emergency_contact_name', 'emergency_contact_phone', 'preferred_username'];
        const missing = REQUIRED.filter(f => !submission[f]);
        if (missing.length > 0)
            throw new common_1.BadRequestException(`Missing required fields: ${missing.join(', ')}`);
        const { data, error } = await supabase
            .from('onboarding_submissions')
            .update({ status: 'submitted', submitted_at: new Date().toISOString() })
            .eq('submission_id', submission.submission_id)
            .select('*')
            .single();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return data;
    }
    async getHROnboardingSubmissions(companyId, statusFilter) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('onboarding_submissions')
            .select('*, applicant_profile ( first_name, last_name, email, phone_number ), job_postings ( title, company_id )')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });
        if (statusFilter)
            query = query.eq('status', statusFilter);
        const { data, error } = await query;
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (data && data.length > 0)
            return data;
        let fallbackQuery = supabase
            .from('onboarding_submissions')
            .select('*, applicant_profile ( first_name, last_name, email, phone_number ), job_postings!inner ( title, company_id )')
            .eq('job_postings.company_id', companyId)
            .order('created_at', { ascending: false });
        if (statusFilter)
            fallbackQuery = fallbackQuery.eq('status', statusFilter);
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError)
            throw new common_1.InternalServerErrorException(fallbackError.message);
        const mismatched = (fallbackData ?? []).filter((s) => s.company_id !== companyId);
        if (mismatched.length > 0) {
            await supabase
                .from('onboarding_submissions')
                .update({ company_id: companyId })
                .in('submission_id', mismatched.map((s) => s.submission_id));
        }
        return fallbackData ?? [];
    }
    async getHROnboardingSubmission(submissionId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('onboarding_submissions')
            .select('*, applicant_profile ( first_name, last_name, email, phone_number ), job_postings ( title )')
            .eq('submission_id', submissionId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        if (!data)
            throw new common_1.NotFoundException('Submission not found.');
        return data;
    }
    async approveOnboardingSubmission(submissionId, roleId, companyId, reviewerUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: submission, error: subErr } = await supabase
            .from('onboarding_submissions')
            .select('*')
            .eq('submission_id', submissionId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (subErr)
            throw new common_1.InternalServerErrorException(subErr.message);
        if (!submission)
            throw new common_1.NotFoundException('Submission not found.');
        if (reviewerUserId && String(submission.created_user_id ?? '') === reviewerUserId) {
            throw new common_1.ForbiddenException('You cannot review your own onboarding submission.');
        }
        if (submission.status !== 'submitted')
            throw new common_1.BadRequestException('Submission must be in "submitted" state to approve.');
        if (!submission.preferred_username)
            throw new common_1.BadRequestException('Applicant must provide a preferred username before approval.');
        const { data: role } = await supabase
            .from('role')
            .select('role_id, role_name')
            .eq('role_id', roleId)
            .maybeSingle();
        if (!role)
            throw new common_1.BadRequestException('Selected role does not exist.');
        const userId = crypto.randomUUID();
        const employeeCode = `EMP-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const startDate = submission.start_date ?? getManilaDateKey();
        const applicantEmailData = (await supabase.from('applicant_profile').select('email').eq('applicant_id', submission.applicant_id).maybeSingle()).data;
        const { error: insertError } = await supabase.from('user_profile').insert({
            user_id: userId,
            email: applicantEmailData?.email ?? '',
            first_name: (0, common_2.normalizeNamePart)(submission.first_name) ?? '',
            last_name: (0, common_2.normalizeNamePart)(submission.last_name) ?? '',
            role_id: roleId,
            company_id: companyId,
            employee_id: employeeCode,
            username: submission.preferred_username,
            account_status: 'Active',
            ...(submission.phone ? { phone_number: submission.phone } : {}),
            ...(submission.address ? { complete_address: submission.address } : {}),
            ...(submission.date_of_birth ? { date_of_birth: submission.date_of_birth } : {}),
            ...(submission.nationality ? { nationality: submission.nationality } : {}),
            ...(submission.civil_status ? { civil_status: submission.civil_status } : {}),
            ...(submission.department_id ? { department_id: submission.department_id } : {}),
            start_date: startDate,
        });
        if (insertError)
            throw new common_1.InternalServerErrorException(insertError.message);
        await supabase.from('user_role_assignments').upsert({
            user_id: userId,
            role_id: roleId,
            is_primary: true,
            is_active: true,
        }, { onConflict: 'user_id,role_id' });
        await supabase.from('role_portal_map').upsert({
            role_id: roleId,
            portal_key: roleNameToPortal(role.role_name),
        }, { onConflict: 'role_id,portal_key' });
        if (MULTI_PORTAL_ELIGIBLE_ROLES.has(String(role.role_name ?? '').trim().toLowerCase())) {
            const { data: employeeRole } = await supabase
                .from('role')
                .select('role_id')
                .eq('company_id', companyId)
                .in('role_name', ['Active Employee', 'Employee'])
                .order('role_name', { ascending: true })
                .maybeSingle();
            if (employeeRole?.role_id) {
                await supabase.from('user_role_assignments').upsert({
                    user_id: userId,
                    role_id: String(employeeRole.role_id),
                    is_primary: false,
                    is_active: true,
                }, { onConflict: 'user_id,role_id' });
                await supabase.from('role_portal_map').upsert({
                    role_id: String(employeeRole.role_id),
                    portal_key: 'employee',
                }, { onConflict: 'role_id,portal_key' });
            }
        }
        try {
            const assignment = await this.timekeepingService.assignInitialScheduleForEmployee({
                companyId,
                employeeId: employeeCode,
                departmentId: submission.department_id ?? null,
                effectiveDate: startDate,
                updatedByName: null,
            });
            this.logger.log(`[approveOnboardingSubmission] Initial schedule assignment for ${employeeCode}: ${assignment.source}`);
        }
        catch (scheduleError) {
            this.logger.warn(`[approveOnboardingSubmission] Could not assign initial schedule: ${scheduleError?.message}`);
        }
        const { error: applicantStatusError } = await supabase
            .from('applicant_profile')
            .update({ status: 'converted_employee' })
            .eq('applicant_id', submission.applicant_id);
        if (applicantStatusError)
            throw new common_1.InternalServerErrorException(applicantStatusError.message);
        try {
            const { data: onboardingSession } = await supabase
                .from('onboarding_sessions')
                .select('session_id')
                .eq('account_id', submission.applicant_id)
                .maybeSingle();
            if (onboardingSession) {
                const { data: sessionItems } = await supabase
                    .from('onboarding_items')
                    .select(`
            onboarding_item_id,
            template_items!inner(tab_category, title)
          `)
                    .eq('session_id', onboardingSession.session_id)
                    .eq('template_items.tab_category', 'documents');
                if (sessionItems && sessionItems.length > 0) {
                    const itemIds = sessionItems.map((i) => i.onboarding_item_id);
                    const { data: docs } = await supabase
                        .from('onboarding_documents')
                        .select('*')
                        .in('onboarding_item_id', itemIds)
                        .eq('is_proof_of_receipt', false);
                    if (docs && docs.length > 0) {
                        const docRows = [];
                        for (const doc of docs) {
                            const item = sessionItems.find((i) => i.onboarding_item_id === doc.onboarding_item_id);
                            const docType = this.normalizeDocType(item?.template_items?.title || 'onboarding-document');
                            let employeeFilePath = doc.file_path || doc.file_url;
                            if (doc.file_path) {
                                try {
                                    const destPath = `${userId}/${Date.now()}_${doc.file_name}`;
                                    const { data: fileData, error: dlErr } = await supabase.storage
                                        .from('onboarding-documents')
                                        .download(doc.file_path);
                                    if (!dlErr && fileData) {
                                        const { error: upErr } = await supabase.storage
                                            .from('employee-documents')
                                            .upload(destPath, fileData, { contentType: doc.file_type || 'application/octet-stream', upsert: true });
                                        if (!upErr)
                                            employeeFilePath = destPath;
                                    }
                                }
                                catch {
                                }
                            }
                            docRows.push({
                                id: crypto.randomUUID(),
                                user_id: userId,
                                document_type: docType,
                                file_path: employeeFilePath,
                                file_name: doc.file_name,
                                file_size: doc.file_size_bytes,
                                status: 'approved',
                                reviewed_at: new Date().toISOString(),
                                uploaded_at: doc.uploaded_at || new Date().toISOString(),
                            });
                        }
                        const { error: employeeDocsError } = await supabase.from('employee_documents').insert(docRows);
                        if (employeeDocsError)
                            throw new common_1.InternalServerErrorException(employeeDocsError.message);
                    }
                }
                await supabase
                    .from('onboarding_sessions')
                    .update({ account_id: userId })
                    .eq('session_id', onboardingSession.session_id);
                const { data: stagingExtra } = await supabase
                    .from('employee_staging')
                    .select('middle_name, place_of_birth, email_address')
                    .eq('session_id', onboardingSession.session_id)
                    .maybeSingle();
                if (stagingExtra) {
                    const extraUpdate = {};
                    if (stagingExtra.middle_name != null)
                        extraUpdate.middle_name = stagingExtra.middle_name;
                    if (stagingExtra.place_of_birth != null)
                        extraUpdate.place_of_birth = stagingExtra.place_of_birth;
                    if (stagingExtra.email_address != null)
                        extraUpdate.personal_email = stagingExtra.email_address;
                    if (Object.keys(extraUpdate).length > 0) {
                        await supabase.from('user_profile').update(extraUpdate).eq('user_id', userId);
                    }
                }
            }
        }
        catch (seedErr) {
            this.logger.error(`Failed to seed employee_documents: ${seedErr?.message}`);
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
        const { error: userInviteError } = await supabase
            .from('user_invites')
            .insert({ invite_id: crypto.randomUUID(), user_id: userId, token_hash: tokenHash, expires_at: expiresAt });
        if (userInviteError)
            throw new common_1.InternalServerErrorException(userInviteError.message);
        const { error: submissionApproveError } = await supabase
            .from('onboarding_submissions')
            .update({ status: 'approved' })
            .eq('submission_id', submissionId);
        if (submissionApproveError)
            throw new common_1.InternalServerErrorException(submissionApproveError.message);
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const inviteLink = `${appUrl}/set-password?token=${rawToken}`;
        const { data: applicant } = await supabase.from('applicant_profile').select('email').eq('applicant_id', submission.applicant_id).maybeSingle();
        try {
            await this.mailService.sendInvite(applicant?.email ?? '', inviteLink);
        }
        catch {
            this.logger.log(`[onboarding approve] invite link for ${applicant?.email}: ${inviteLink}`);
        }
        return { user_id: userId, employee_id: employeeCode, email: applicant?.email ?? '', invite_expires_at: expiresAt };
    }
    async rejectOnboardingSubmission(submissionId, hrNotes, companyId, reviewerUserId) {
        const supabase = this.supabaseService.getClient();
        const { data: submission } = await supabase
            .from('onboarding_submissions')
            .select('submission_id, status, created_user_id')
            .eq('submission_id', submissionId)
            .eq('company_id', companyId)
            .maybeSingle();
        if (!submission)
            throw new common_1.NotFoundException('Submission not found.');
        if (reviewerUserId && String(submission.created_user_id ?? '') === reviewerUserId) {
            throw new common_1.ForbiddenException('You cannot review your own onboarding submission.');
        }
        if (submission.status !== 'submitted')
            throw new common_1.BadRequestException('Only submitted onboarding forms can be rejected.');
        const { error } = await supabase
            .from('onboarding_submissions')
            .update({ status: 'rejected', hr_notes: hrNotes })
            .eq('submission_id', submissionId);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: 'Submission rejected.' };
    }
    async getSessionByApplicantId(applicantId) {
        const session = await this.getMySession(applicantId);
        if (!session)
            return null;
        if (!session.employee_name) {
            const supabase = this.supabaseService.getClient();
            const { data: applicant } = await supabase
                .from('applicant_profile')
                .select('first_name, last_name')
                .eq('applicant_id', applicantId)
                .maybeSingle();
            if (applicant) {
                session.employee_name = `${applicant.first_name} ${applicant.last_name}`;
            }
        }
        return session;
    }
    async createApplicantSession(params) {
        const supabase = this.supabaseService.getClient();
        const { data: existing } = await supabase
            .from('onboarding_sessions')
            .select('session_id')
            .eq('account_id', params.applicantId)
            .maybeSingle();
        if (existing)
            return existing;
        const { data: posting } = await supabase
            .from('job_postings')
            .select('department_id, title')
            .eq('job_posting_id', params.jobPostingId)
            .maybeSingle();
        let departmentName = 'General';
        if (posting?.department_id) {
            const { data: dept } = await supabase
                .from('department')
                .select('department_name')
                .eq('department_id', posting.department_id)
                .maybeSingle();
            if (dept?.department_name)
                departmentName = dept.department_name;
        }
        let templateId = null;
        let templateItems = [];
        let defaultDeadlineDays = 14;
        if (posting?.department_id) {
            const { data: template } = await supabase
                .from('onboarding_templates')
                .select('template_id, default_deadline_days, template_items(*)')
                .eq('department_id', posting.department_id)
                .limit(1)
                .maybeSingle();
            if (template) {
                templateId = template.template_id;
                templateItems = template.template_items || [];
                defaultDeadlineDays = template.default_deadline_days || 14;
            }
        }
        if (!templateId) {
            const { data: fallback } = await supabase
                .from('onboarding_templates')
                .select('template_id, default_deadline_days, template_items(*)')
                .limit(1)
                .maybeSingle();
            if (fallback) {
                templateId = fallback.template_id;
                templateItems = fallback.template_items || [];
                defaultDeadlineDays = fallback.default_deadline_days || 14;
            }
        }
        if (!templateId) {
            this.logger.error('No onboarding template found — cannot create applicant session');
            return null;
        }
        const sessionId = crypto.randomUUID();
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + defaultDeadlineDays);
        const { error: sessionErr } = await supabase
            .from('onboarding_sessions')
            .insert({
            session_id: sessionId,
            account_id: params.applicantId,
            template_id: templateId,
            assigned_position: posting?.title || 'New Hire',
            assigned_department: departmentName,
            status: 'not-started',
            progress_percentage: 0,
            deadline_date: deadline.toISOString(),
            offer_status: 'pending',
        });
        if (sessionErr) {
            this.logger.error(`Failed to create applicant session: ${sessionErr.message}`);
            return null;
        }
        if (templateItems.length > 0) {
            const onboardingItems = templateItems.map((ti) => ({
                onboarding_item_id: crypto.randomUUID(),
                session_id: sessionId,
                template_item_id: ti.item_id,
                status: 'pending',
                is_requested: null,
                delivery_method: null,
            }));
            const { error: itemsErr } = await supabase
                .from('onboarding_items')
                .insert(onboardingItems);
            if (itemsErr) {
                this.logger.error(`Failed to create onboarding items for applicant session: ${itemsErr.message}`);
            }
        }
        this.logger.log(`Applicant onboarding session created: ${sessionId} for applicant ${params.applicantId}`);
        try {
            await this.notificationsService.createApplicantNotification({
                applicant_id: params.applicantId,
                message: `You have a job offer for ${posting?.title ?? 'a new position'}. Open the app to accept or decline.`,
                notification_type: 'status_update',
                job_posting_id: params.jobPostingId,
            });
        }
        catch (notifErr) {
            this.logger.error(`Failed to send offer notification: ${notifErr}`);
        }
        return { session_id: sessionId };
    }
    async createTrainingVideo(companyId, dto, createdBy) {
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('onboarding_training_videos')
            .insert({
            company_id: companyId,
            template_id: dto.template_id,
            title: dto.title,
            description: dto.description ?? null,
            video_url: dto.video_url,
            sequence_order: dto.sequence_order,
            is_active: dto.is_active ?? true,
            created_by: createdBy,
        })
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async getTrainingVideos(companyId, templateId) {
        const supabase = this.supabaseService.getClient();
        let query = supabase
            .from('onboarding_training_videos')
            .select('*')
            .eq('company_id', companyId)
            .order('sequence_order', { ascending: true });
        if (templateId)
            query = query.eq('template_id', templateId);
        const { data, error } = await query;
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data ?? [];
    }
    async updateTrainingVideo(videoId, companyId, dto) {
        const supabase = this.supabaseService.getClient();
        const updates = { updated_at: new Date().toISOString() };
        if (dto.title !== undefined)
            updates.title = dto.title;
        if (dto.description !== undefined)
            updates.description = dto.description;
        if (dto.video_url !== undefined)
            updates.video_url = dto.video_url;
        if (dto.sequence_order !== undefined)
            updates.sequence_order = dto.sequence_order;
        if (dto.is_active !== undefined)
            updates.is_active = dto.is_active;
        const { data, error } = await supabase
            .from('onboarding_training_videos')
            .update(updates)
            .eq('video_id', videoId)
            .eq('company_id', companyId)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        if (!data)
            throw new common_1.NotFoundException('Training video not found');
        return data;
    }
    async deleteTrainingVideo(videoId, companyId) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('onboarding_training_videos')
            .delete()
            .eq('video_id', videoId)
            .eq('company_id', companyId);
        if (error)
            throw new common_1.BadRequestException(error.message);
    }
    async getApplicantTrainingVideos(applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data: session } = await supabase
            .from('onboarding_sessions')
            .select('template_id')
            .eq('account_id', applicantId)
            .maybeSingle();
        if (!session?.template_id)
            return [];
        const { data: videos, error: vErr } = await supabase
            .from('onboarding_training_videos')
            .select('*')
            .eq('template_id', session.template_id)
            .eq('is_active', true)
            .order('sequence_order', { ascending: true });
        if (vErr)
            throw new common_1.BadRequestException(vErr.message);
        const videoIds = (videos ?? []).map((v) => v.video_id);
        const progressMap = {};
        if (videoIds.length > 0) {
            const { data: progressRows } = await supabase
                .from('applicant_video_progress')
                .select('*')
                .eq('applicant_id', applicantId)
                .in('video_id', videoIds);
            for (const row of progressRows ?? []) {
                progressMap[row.video_id] = row;
            }
        }
        return (videos ?? []).map((v) => ({
            ...v,
            progress: progressMap[v.video_id] ?? null,
        }));
    }
    async saveVideoProgress(applicantId, videoId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data: existing } = await supabase
            .from('applicant_video_progress')
            .select('progress_id, max_watched_seconds, is_completed')
            .eq('applicant_id', applicantId)
            .eq('video_id', videoId)
            .maybeSingle();
        const newMax = Math.max(dto.max_watched_seconds, existing?.max_watched_seconds ?? 0);
        const alreadyCompleted = existing?.is_completed ?? false;
        const isCompleted = alreadyCompleted || (dto.is_completed ?? false);
        const payload = {
            applicant_id: applicantId,
            video_id: videoId,
            watched_seconds: dto.watched_seconds,
            max_watched_seconds: newMax,
            is_completed: isCompleted,
            last_watched_at: new Date().toISOString(),
            ...(isCompleted && !alreadyCompleted ? { completed_at: new Date().toISOString() } : {}),
        };
        if (existing) {
            const { data, error } = await supabase
                .from('applicant_video_progress')
                .update(payload)
                .eq('applicant_id', applicantId)
                .eq('video_id', videoId)
                .select()
                .single();
            if (error)
                throw new common_1.BadRequestException(error.message);
            return data;
        }
        const { data, error } = await supabase
            .from('applicant_video_progress')
            .insert(payload)
            .select()
            .single();
        if (error)
            throw new common_1.BadRequestException(error.message);
        return data;
    }
    async acceptOffer(sessionId, applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data: session, error: fetchErr } = await supabase
            .from('onboarding_sessions')
            .select('session_id, account_id, offer_status')
            .eq('session_id', sessionId)
            .maybeSingle();
        if (fetchErr || !session) {
            throw new common_1.ForbiddenException('Session not found.');
        }
        if (session.account_id !== applicantId) {
            throw new common_1.ForbiddenException('Access denied.');
        }
        if (session.offer_status !== 'pending') {
            throw new common_1.BadRequestException('Offer already responded to.');
        }
        const { error: acceptErr } = await supabase
            .from('onboarding_sessions')
            .update({ offer_status: 'accepted' })
            .eq('session_id', sessionId);
        if (acceptErr)
            throw new common_1.InternalServerErrorException(acceptErr.message);
        const { error: declineErr } = await supabase
            .from('onboarding_sessions')
            .update({ offer_status: 'declined' })
            .eq('account_id', applicantId)
            .eq('offer_status', 'pending')
            .neq('session_id', sessionId);
        if (declineErr) {
            this.logger.error(`Failed to auto-decline other sessions: ${declineErr.message}`);
        }
        return { message: 'Offer accepted.' };
    }
    async declineOffer(sessionId, applicantId) {
        const supabase = this.supabaseService.getClient();
        const { data: session, error: fetchErr } = await supabase
            .from('onboarding_sessions')
            .select('session_id, account_id, offer_status')
            .eq('session_id', sessionId)
            .maybeSingle();
        if (fetchErr || !session) {
            throw new common_1.ForbiddenException('Session not found.');
        }
        if (session.account_id !== applicantId) {
            throw new common_1.ForbiddenException('Access denied.');
        }
        if (session.offer_status !== 'pending') {
            throw new common_1.BadRequestException('Offer already responded to.');
        }
        const { error } = await supabase
            .from('onboarding_sessions')
            .update({ offer_status: 'declined' })
            .eq('session_id', sessionId);
        if (error)
            throw new common_1.InternalServerErrorException(error.message);
        return { message: 'Offer declined.' };
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = OnboardingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        mail_service_1.MailService,
        config_1.ConfigService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService,
        timekeeping_service_1.TimekeepingService])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map