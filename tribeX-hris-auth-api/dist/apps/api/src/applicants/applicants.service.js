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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicantsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const supabase_1 = require("../../../../libs/supabase/src");
const mail_service_1 = require("../mail/mail.service");
const common_2 = require("../../../../libs/common/src");
const bcrypt = __importStar(require("bcryptjs"));
const crypto = __importStar(require("node:crypto"));
function sha256(input) {
    return crypto.createHash('sha256').update(input).digest('hex');
}
let ApplicantsService = class ApplicantsService {
    supabaseService;
    mailService;
    config;
    jwtService;
    sfiaResumeBucket = 'sfia-resumes';
    constructor(supabaseService, mailService, config, jwtService) {
        this.supabaseService = supabaseService;
        this.mailService = mailService;
        this.config = config;
        this.jwtService = jwtService;
    }
    async register(dto, companyId) {
        const supabase = this.supabaseService.getClient();
        const firstName = (0, common_2.normalizeNamePart)(dto.first_name);
        const lastName = (0, common_2.normalizeNamePart)(dto.last_name);
        if (!firstName || !lastName) {
            throw new common_1.BadRequestException('First name and last name are required.');
        }
        const { data: existing } = await supabase
            .from('applicant_profile')
            .select('applicant_id, status')
            .eq('email', dto.email)
            .maybeSingle();
        if (existing) {
            if (existing.status === 'unverified') {
                await this.resendVerification(dto.email);
                throw new common_1.ConflictException('UNVERIFIED_RESENT: This email is already registered but the address was never verified. ' +
                    'We\'ve sent a fresh verification link — please check your inbox.');
            }
            throw new common_1.ConflictException('An account with this email already exists.');
        }
        const password_hash = await bcrypt.hash(dto.password, 12);
        const applicant_id = crypto.randomUUID();
        const applicant_code = `APP-${Math.floor(1000000 + Math.random() * 9000000)}`;
        const { error: insertError } = await supabase
            .from('applicant_profile')
            .insert({
            applicant_id,
            applicant_code,
            first_name: firstName,
            last_name: lastName,
            email: dto.email,
            phone_number: dto.phone_number ?? null,
            password_hash,
            role: 'Applicant',
            status: 'unverified',
            company_id: companyId ?? null,
            created_at: new Date().toISOString(),
        });
        if (insertError)
            throw new common_1.InternalServerErrorException('Could not create your account. Please try again.');
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const { error: tokenError } = await supabase
            .from('email_verifications')
            .insert({
            applicant_id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        if (tokenError) {
            await supabase.from('applicant_profile').delete().eq('applicant_id', applicant_id);
            throw new common_1.InternalServerErrorException('Could not complete registration. Please try again.');
        }
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const verifyLink = `${appUrl}/applicant/verify-email?token=${rawToken}&email=${encodeURIComponent(dto.email)}`;
        try {
            await this.mailService.sendVerificationEmail(dto.email, verifyLink);
        }
        catch {
            await supabase.from('email_verifications').delete().eq('applicant_id', applicant_id);
            await supabase.from('applicant_profile').delete().eq('applicant_id', applicant_id);
            throw new common_1.InternalServerErrorException('We could not send a verification email to that address. Please check the email and try again.');
        }
        return {
            applicant_id,
            applicant_code,
            email: dto.email,
            first_name: firstName,
            last_name: lastName,
            message: 'Account created. Please check your email to verify your address.',
        };
    }
    async verifyEmail(token) {
        if (!token)
            throw new common_1.BadRequestException('Verification token is required');
        const supabase = this.supabaseService.getClient();
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const { data: record, error } = await supabase
            .from('email_verifications')
            .select('verification_id, applicant_id, expires_at, used_at')
            .eq('token_hash', tokenHash)
            .maybeSingle();
        if (error || !record)
            throw new common_1.UnauthorizedException('Invalid or expired verification link');
        if (record.used_at)
            throw new common_1.UnauthorizedException('This verification link has already been used');
        if (new Date(record.expires_at) <= new Date())
            throw new common_1.UnauthorizedException('This verification link has expired');
        await supabase
            .from('email_verifications')
            .update({ used_at: new Date().toISOString() })
            .eq('verification_id', record.verification_id);
        await supabase
            .from('applicant_profile')
            .update({ status: 'active' })
            .eq('applicant_id', record.applicant_id);
        return { message: 'Email verified successfully. You can now sign in.' };
    }
    async login(dto) {
        const supabase = this.supabaseService.getClient();
        const { data: applicant, error } = await supabase
            .from('applicant_profile')
            .select('applicant_id, email, password_hash, first_name, last_name, phone_number, status, company_id')
            .eq('email', dto.email)
            .maybeSingle();
        if (error || !applicant)
            throw new common_1.UnauthorizedException('No account found with that email address.');
        if (applicant.status === 'converted_employee') {
            throw new common_1.UnauthorizedException('CONVERTED_EMPLOYEE: Your applicant account has been activated as an employee. Please log in through the employee portal instead.');
        }
        if (applicant.status === 'active' || applicant.status === 'onboarding') {
            const { data: employeeProfile } = await supabase
                .from('user_profile')
                .select('user_id')
                .eq('email', applicant.email)
                .maybeSingle();
            if (employeeProfile) {
                await supabase
                    .from('applicant_profile')
                    .update({ status: 'converted_employee' })
                    .eq('applicant_id', applicant.applicant_id);
                throw new common_1.UnauthorizedException('CONVERTED_EMPLOYEE: Your applicant account has been activated as an employee. Please log in through the employee portal instead.');
            }
        }
        if (applicant.status === 'unverified') {
            throw new common_1.UnauthorizedException('Please verify your email before signing in.');
        }
        const isMatch = await bcrypt.compare(dto.password, applicant.password_hash);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Incorrect password. Please try again.');
        const access_token = await this.jwtService.signAsync({
            type: 'access',
            sub_userid: applicant.applicant_id,
            role_name: 'Applicant',
            company_id: applicant.company_id ?? null,
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            phone_number: applicant.phone_number ?? null,
        }, { expiresIn: '8h' });
        const refreshMaxAgeMs = (dto.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000;
        const refresh_token = await this.jwtService.signAsync({ type: 'refresh', sub_userid: applicant.applicant_id }, { expiresIn: Math.floor(refreshMaxAgeMs / 1000) });
        const decoded = this.jwtService.decode(refresh_token);
        await supabase.from('applicant_refresh_session').insert({
            applicant_id: applicant.applicant_id,
            token_hash: sha256(refresh_token),
            expires_at: new Date(decoded.exp * 1000).toISOString(),
        });
        return {
            access_token,
            refresh_token,
            refresh_max_age_ms: refreshMaxAgeMs,
        };
    }
    async refresh(refreshToken) {
        const supabase = this.supabaseService.getClient();
        let decoded;
        try {
            decoded = await this.jwtService.verifyAsync(refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (decoded.type !== 'refresh')
            throw new common_1.UnauthorizedException('Invalid refresh token type');
        const token_hash = sha256(refreshToken);
        const { data: session, error } = await supabase
            .from('applicant_refresh_session')
            .select('expires_at, revoked_at')
            .eq('applicant_id', decoded.sub_userid)
            .eq('token_hash', token_hash)
            .maybeSingle();
        if (error || !session)
            throw new common_1.UnauthorizedException('Session not found');
        if (session.revoked_at)
            throw new common_1.UnauthorizedException('Session revoked');
        if (new Date(session.expires_at) <= new Date())
            throw new common_1.UnauthorizedException('Session expired');
        const { data: applicant, error: appErr } = await supabase
            .from('applicant_profile')
            .select('applicant_id, first_name, last_name, role, company_id, status')
            .eq('applicant_id', decoded.sub_userid)
            .maybeSingle();
        if (appErr || !applicant)
            throw new common_1.UnauthorizedException('Applicant not found');
        if (applicant.status === 'converted_employee')
            throw new common_1.UnauthorizedException('CONVERTED_EMPLOYEE: Your applicant account has been activated as an employee. Please log in through the employee portal instead.');
        if (applicant.status === 'inactive')
            throw new common_1.UnauthorizedException('Account deactivated');
        const access_token = await this.jwtService.signAsync({
            type: 'access',
            sub_userid: applicant.applicant_id,
            role_name: applicant.role,
            first_name: applicant.first_name,
            last_name: applicant.last_name,
            company_id: applicant.company_id ?? null,
        }, { expiresIn: '15m' });
        const refreshRemainingMs = new Date(session.expires_at).getTime() - Date.now();
        if (refreshRemainingMs <= 0) {
            throw new common_1.UnauthorizedException('Session expired');
        }
        const rotatedRefreshToken = await this.jwtService.signAsync({
            type: 'refresh',
            sub_userid: applicant.applicant_id,
        }, { expiresIn: Math.max(1, Math.floor(refreshRemainingMs / 1000)) });
        const { data: rotatedSession, error: rotateErr } = await supabase
            .from('applicant_refresh_session')
            .update({ token_hash: sha256(rotatedRefreshToken) })
            .eq('applicant_id', decoded.sub_userid)
            .eq('token_hash', token_hash)
            .is('revoked_at', null)
            .select('applicant_id')
            .maybeSingle();
        if (rotateErr || !rotatedSession) {
            throw new common_1.UnauthorizedException('Failed to rotate session');
        }
        return {
            access_token,
            refresh_token: rotatedRefreshToken,
            refresh_max_age_ms: refreshRemainingMs,
        };
    }
    async resendVerification(email) {
        if (!email)
            throw new common_1.BadRequestException('Email is required');
        const supabase = this.supabaseService.getClient();
        const { data: applicant } = await supabase
            .from('applicant_profile')
            .select('applicant_id, email, status')
            .eq('email', email)
            .maybeSingle();
        if (!applicant)
            throw new common_1.BadRequestException('No account found with that email address.');
        if (applicant.status !== 'unverified')
            throw new common_1.BadRequestException('This account is already verified.');
        await supabase
            .from('email_verifications')
            .update({ used_at: new Date().toISOString() })
            .eq('applicant_id', applicant.applicant_id)
            .is('used_at', null);
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const { error: tokenError } = await supabase
            .from('email_verifications')
            .insert({
            applicant_id: applicant.applicant_id,
            token_hash: tokenHash,
            expires_at: expiresAt,
        });
        if (tokenError)
            throw new common_1.InternalServerErrorException('Could not generate a new verification link. Please try again.');
        const appUrl = this.config.get('APP_URL') ?? 'http://localhost:3000';
        const verifyLink = `${appUrl}/applicant/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`;
        try {
            await this.mailService.sendVerificationEmail(email, verifyLink);
        }
        catch {
            throw new common_1.InternalServerErrorException('We could not send the verification email. Please try again.');
        }
        return { message: 'A new verification email has been sent. Please check your inbox.' };
    }
    async getMe(applicantId) {
        const supabase = this.supabaseService.getClient();
        const selectCols = [
            'applicant_id, first_name, middle_name, last_name, email, phone_number, personal_email, date_of_birth, place_of_birth, nationality, civil_status, complete_address, applicant_code, avatar_url, resume_url, resume_name, resume_uploaded_at',
            'applicant_id, first_name, middle_name, last_name, email, phone_number, personal_email, date_of_birth, place_of_birth, nationality, civil_status, complete_address, applicant_code, avatar_url',
            'applicant_id, first_name, last_name, email, phone_number, applicant_code',
        ];
        let profile = null;
        for (const cols of selectCols) {
            const { data, error } = await supabase
                .from('applicant_profile')
                .select(cols)
                .eq('applicant_id', applicantId)
                .maybeSingle();
            if (!error && data) {
                profile = data;
                break;
            }
        }
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        if (profile['resume_url'] && !profile['resume_url'].startsWith('https://')) {
            const { data: urlData } = await supabase.storage
                .from('applicant-resumes')
                .createSignedUrl(profile['resume_url'], 60 * 60 * 24 * 7);
            if (urlData?.signedUrl) {
                profile['resume_url'] = urlData.signedUrl;
            }
        }
        return profile;
    }
    async uploadResume(applicantId, file) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded.');
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only PDF, DOC, and DOCX are allowed.');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File is too large. Maximum size is 5MB.');
        }
        const supabase = this.supabaseService.getClient();
        const filePath = `${applicantId}/${Date.now()}_${file.originalname}`;
        const { error: uploadErr } = await supabase.storage
            .from('applicant-resumes')
            .upload(filePath, file.buffer, { contentType: file.mimetype, upsert: true });
        if (uploadErr)
            throw new common_1.BadRequestException(`Upload failed: ${uploadErr.message}`);
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('applicant_profile')
            .update({ resume_url: filePath, resume_name: file.originalname, resume_uploaded_at: now })
            .eq('applicant_id', applicantId);
        if (updateError)
            throw new common_1.InternalServerErrorException('Failed to save resume metadata.');
        const { data: urlData } = await supabase.storage
            .from('applicant-resumes')
            .createSignedUrl(filePath, 60 * 60 * 24 * 7);
        return {
            resume_url: urlData?.signedUrl ?? filePath,
            resume_name: file.originalname,
            resume_uploaded_at: now,
        };
    }
    async deleteResume(applicantId) {
        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('applicant_profile')
            .update({ resume_url: null, resume_name: null, resume_uploaded_at: null })
            .eq('applicant_id', applicantId);
        if (error)
            throw new common_1.InternalServerErrorException('Failed to delete resume.');
        return { message: 'Resume deleted' };
    }
    async updateMe(applicantId, body) {
        const allowed = ['first_name', 'middle_name', 'last_name', 'phone_number', 'personal_email', 'date_of_birth', 'place_of_birth', 'nationality', 'civil_status', 'complete_address', 'avatar_url'];
        const patch = {};
        for (const key of allowed) {
            if (body[key] !== undefined)
                patch[key] = body[key];
        }
        for (const key of ['first_name', 'middle_name', 'last_name']) {
            if (patch[key] !== undefined)
                patch[key] = (0, common_2.normalizeNamePart)(patch[key]);
        }
        if (patch.first_name === null || patch.last_name === null) {
            throw new common_1.BadRequestException('First name and last name cannot be empty.');
        }
        if (patch.date_of_birth && !(0, common_2.isAtLeastAge)(String(patch.date_of_birth), 18)) {
            throw new common_1.BadRequestException('Applicants must be at least 18 years old.');
        }
        if (Object.keys(patch).length === 0)
            return { message: 'Nothing to update' };
        const supabase = this.supabaseService.getClient();
        const { data, error } = await supabase
            .from('applicant_profile')
            .update(patch)
            .eq('applicant_id', applicantId)
            .select('applicant_id, first_name, middle_name, last_name, email, phone_number, personal_email, date_of_birth, place_of_birth, nationality, civil_status, complete_address, avatar_url, resume_url, resume_name, resume_uploaded_at')
            .maybeSingle();
        if (error)
            throw new common_1.InternalServerErrorException('Failed to update profile');
        return data;
    }
    async logout(refreshToken, accessToken) {
        const supabase = this.supabaseService.getClient();
        let decoded;
        try {
            decoded = await this.jwtService.verifyAsync(refreshToken);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        await supabase
            .from('applicant_refresh_session')
            .update({ revoked_at: new Date().toISOString() })
            .eq('applicant_id', decoded.sub_userid)
            .eq('token_hash', sha256(refreshToken));
        if (accessToken) {
            try {
                const accessDecoded = await this.jwtService.verifyAsync(accessToken);
                if (accessDecoded?.exp) {
                    await supabase.from('token_blacklist').insert({
                        token_hash: sha256(accessToken),
                        expires_at: new Date(accessDecoded.exp * 1000).toISOString(),
                    });
                }
            }
            catch { }
        }
    }
    async uploadSfiaResume(applicantId, dto) {
        const supabase = this.supabaseService.getClient();
        const { data: existingApp, error: checkError } = await supabase
            .from('job_applications')
            .select('application_id')
            .eq('applicant_id', applicantId)
            .eq('job_posting_id', dto.job_posting_id)
            .maybeSingle();
        if (checkError && checkError.code !== 'PGRST116') {
            throw new common_1.InternalServerErrorException('Could not verify application status. Please try again.');
        }
        if (existingApp) {
            throw new common_1.ConflictException('You have already submitted an application for this role.');
        }
        const allowedMimeTypes = new Set([
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);
        if (!allowedMimeTypes.has(dto.mime_type)) {
            throw new common_1.BadRequestException('Only PDF, DOC, and DOCX files are supported.');
        }
        const payload = dto.content_base64.includes(',')
            ? dto.content_base64.split(',', 2)[1]
            : dto.content_base64;
        const fileBuffer = Buffer.from(payload, 'base64');
        if (!fileBuffer.length) {
            throw new common_1.BadRequestException('Uploaded file is empty.');
        }
        const maxBytes = 10 * 1024 * 1024;
        if (fileBuffer.length > maxBytes) {
            throw new common_1.BadRequestException('Resume file must be 10MB or smaller.');
        }
        await this.ensureResumeBucket();
        const safeFileName = dto.file_name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const storagePath = `${applicantId}/${dto.job_posting_id}/${Date.now()}-${safeFileName}`;
        const { error: uploadError } = await supabase.storage
            .from(this.sfiaResumeBucket)
            .upload(storagePath, fileBuffer, {
            contentType: dto.mime_type,
            upsert: false,
        });
        if (uploadError) {
            throw new common_1.InternalServerErrorException(uploadError.message);
        }
        const { data: signedData, error: signedError } = await supabase.storage
            .from(this.sfiaResumeBucket)
            .createSignedUrl(storagePath, 60 * 60);
        if (signedError) {
            throw new common_1.InternalServerErrorException(signedError.message);
        }
        return {
            file_name: dto.file_name,
            storage_path: storagePath,
            signed_url: signedData.signedUrl,
        };
    }
    async ensureResumeBucket() {
        const supabase = this.supabaseService.getClient();
        const { data: buckets, error } = await supabase.storage.listBuckets();
        if (error) {
            throw new common_1.InternalServerErrorException(error.message);
        }
        const exists = buckets?.some((bucket) => bucket.name === this.sfiaResumeBucket);
        if (exists)
            return;
        const { error: createError } = await supabase.storage.createBucket(this.sfiaResumeBucket, {
            public: false,
            fileSizeLimit: 10 * 1024 * 1024,
            allowedMimeTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ],
        });
        if (createError && !createError.message.toLowerCase().includes('already')) {
            throw new common_1.InternalServerErrorException(createError.message);
        }
    }
};
exports.ApplicantsService = ApplicantsService;
exports.ApplicantsService = ApplicantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_1.SupabaseService,
        mail_service_1.MailService,
        config_1.ConfigService,
        jwt_1.JwtService])
], ApplicantsService);
//# sourceMappingURL=applicants.service.js.map