import { API_BASE_URL } from "@/lib/api";
import {
  applicantLogoutApi,
  applicantRegisterApi,
  authFetch,
  getApplicantJobs,
  loginApi,
  logoutApi,
  applyToJob,
  getUnreadNotifications,
  markNotificationAsRead,
} from "@/lib/authApi";
import {
  confirmTask,
  addRemark,
  adminCreateTrainingVideo,
  adminDeleteTrainingVideo,
  adminGetTrainingVideos,
  adminUploadTrainingVideo,
  adminUpdateTrainingVideo,
  approveSession,
  assignTemplate,
  createPosition,
  createTemplate,
  deleteTemplateItem,
  getAllSessions,
  getAllPositions,
  getAllTemplates,
  getDepartments,
  getMyTrainingVideos,
  getMySession,
  getSessionById,
  requestEquipment,
  saveProfile,
  saveVideoProgress,
  submitForReview,
  updateItemStatus,
  updateSessionDeadline,
  updateTemplateItem,
  uploadDocument,
  uploadTemplateImage,
  rejectSession,
} from "@/lib/onboardingApi";
import { clearAuthStorage, setTokens, writeAccessToken } from "@/lib/authStorage";

const jsonResponse = (body: unknown, init: { status?: number } = {}) =>
  ({
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response);

describe("auth and onboarding api", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    clearAuthStorage();
    localStorage.clear();
    sessionStorage.clear();
    global.fetch = jest.fn();
  });

  it("handles login, logout, and applicant logout flows", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ access_token: "token" }))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}));

    await expect(loginApi({ identifier: "demo", password: "pw", rememberMe: true })).resolves.toMatchObject({
      access_token: "token",
    });
    setTokens({ access_token: "token", rememberMe: true });
    await expect(logoutApi()).resolves.toBeUndefined();
    await expect(applicantLogoutApi()).resolves.toBeUndefined();
  });

  it("retrieves jobs, applies to jobs, and handles notifications", async () => {
    writeAccessToken("abc");
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse([{ job_posting_id: "1" }]))
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse([{ notification_id: "n1" }]))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse({}));

    await expect(getApplicantJobs()).resolves.toEqual([{ job_posting_id: "1" }]);
    await expect(applyToJob("job-1", { answers: [] })).resolves.toMatchObject({ success: true });
    await expect(getUnreadNotifications("app-1")).resolves.toEqual([{ notification_id: "n1" }]);
    await expect(markNotificationAsRead("n1")).resolves.toBeUndefined();
  });

  it("uses authFetch and refreshes when needed", async () => {
    clearAuthStorage();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse({ access_token: "refreshed" }))
      .mockResolvedValueOnce(jsonResponse({}, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ access_token: "refreshed" }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const response = await authFetch(`${API_BASE_URL}/jobs/applicant/open`);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("validates onboarding and HR session helpers", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(jsonResponse(null, { status: 200 }))
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse({ success: true }))
      .mockResolvedValueOnce(jsonResponse([{ id: "s1" }]));

    await expect(getMySession()).resolves.toBeNull();
    await expect(confirmTask("item-1")).resolves.toMatchObject({ success: true });
    await expect(requestEquipment("item-2", true, "office")).resolves.toMatchObject({ success: true });
    await expect(saveProfile("session-1", { first_name: "Ada" } as never)).resolves.toMatchObject({ success: true });
    writeAccessToken("abc");
    await expect(getAllSessions()).resolves.toEqual([{ id: "s1" }]);
  });

  it("covers remaining onboarding wrapper endpoints", async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    (global.fetch as jest.Mock).mockResolvedValue(jsonResponse({}));

    await uploadDocument("item-1", file);
    await submitForReview("session-1");
    await updateItemStatus("item-1", "approved");
    await addRemark("session-1", "profile", "Looks good");
    await updateSessionDeadline("session-1", "2026-01-01");
    await approveSession("session-1");
    await rejectSession("session-1", "missing info");
    await getAllTemplates();
    await createTemplate({} as never);
    await assignTemplate({} as never);
    await getAllPositions();
    await createPosition("dept-1", "Engineer");
    await deleteTemplateItem("item-1");
    await updateTemplateItem("item-1", {} as never);
    await getDepartments();
    await adminUploadTrainingVideo(file);
    await adminGetTrainingVideos();
    await adminCreateTrainingVideo({} as never);
    await adminUpdateTrainingVideo("video-1", {} as never);
    await adminDeleteTrainingVideo("video-1");
    await getMyTrainingVideos();
    await saveVideoProgress("video-1", { progress: 50 } as never);
    await getSessionById("session-1");
  });
});
