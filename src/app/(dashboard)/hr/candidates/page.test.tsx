import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CandidateEvaluationPage from "./page";

const mockJobs = [
  {
    job_posting_id: "job-1",
    title: "Senior Software Engineer",
    department_id: "dept-1",
    status: "open",
    location: "Remote",
    closes_at: null,
  },
  {
    job_posting_id: "job-2",
    title: "Product Manager",
    department_id: "dept-2",
    status: "open",
    location: "Manila",
    closes_at: null,
  },
  {
    job_posting_id: "job-3",
    title: "UX Designer",
    department_id: "dept-3",
    status: "open",
    location: "Remote",
    closes_at: null,
  },
];

const mockCandidates = Array.from({ length: 22 }, (_, index) => ({
  application_id: `app-${index + 1}`,
  applicant_id: `user-${index + 1}`,
  first_name: `Candidate${index + 1}`,
  last_name: "Tester",
  email: `candidate${index + 1}@example.com`,
  phone_number: null,
  applicant_code: null,
  status: "interviewing",
  applied_at: "2025-01-01T00:00:00.000Z",
  sfia_match_percentage: 80 - index,
  sfia_rank: index + 1,
  manual_rank_position: null,
  effective_rank: index + 1,
  skill_breakdown: [
    {
      sfia_skill_id: "skill-1",
      skill_name: "Architecture",
      demand_level: 5,
      supply_level: 4,
      points: 8,
      matched: true,
    },
  ],
}));

const mockRankedCandidatesResponse = {
  job_posting_id: "job-1",
  title: "Senior Software Engineer",
  ranking_mode: "sfia",
  total_candidates: mockCandidates.length,
  top_count: 20,
  required_skill_count: 1,
  candidates: mockCandidates,
};

jest.mock("@/lib/candidateApi", () => ({
  getCandidateJobs: jest.fn(async () => mockJobs),
  getRankedCandidates: jest.fn(async () => mockRankedCandidatesResponse),
  getSurveyScore: jest.fn(async () => ({ surveyScore: 0 })),
  saveManualRanking: jest.fn(async () => ({ message: "OK", job_posting_id: "job-1", updated_count: 0 })),
}));

// ── helpers ──────────────────────────────────────────────────────────────────

/** Returns all expand/collapse toggle buttons (they carry the "shrink-0" class and no aria-label). */
function getExpandButtons(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>("button.shrink-0"),
  ).filter((btn) => !btn.getAttribute("aria-label"));
}

async function renderPage() {
  const utils = render(<CandidateEvaluationPage />);
  await screen.findByRole("button", { name: /show all/i });
  return utils;
}

// ── rendering ────────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – rendering", () => {
  it("renders the page heading", async () => {
    await renderPage();
    expect(
      screen.getByText("Candidate Evaluation Dashboard")
    ).toBeInTheDocument();
  });

  it("shows the default job title in the selector button", async () => {
    await renderPage();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("shows SFIA mode label by default", async () => {
    await renderPage();
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
    expect(
      screen.getByText(/sorted by sfia relevance score/i)
    ).toBeInTheDocument();
  });

  it("renders the Top 20 Avg Fit stat block", async () => {
    await renderPage();
    expect(screen.getByText("Top 20 Avg Fit")).toBeInTheDocument();
  });

  it("renders the three podium (top-3) candidate cards", async () => {
    const { container } = await renderPage();
    expect(container.querySelectorAll(".bg-amber-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-slate-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-orange-50").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a 'show all' toggle when there are more than 20 candidates", async () => {
    await renderPage();
    expect(
      screen.getByRole("button", { name: /show all/i })
    ).toBeInTheDocument();
  });
});

// ── job selector ─────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – job selector", () => {
  it("opens the dropdown when the job button is clicked", async () => {
    await renderPage();
    const jobBtn = screen.getByRole("button", { name: /senior software engineer/i });
    fireEvent.click(jobBtn);
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("UX Designer")).toBeInTheDocument();
  });

  it("selects a different job and updates the button label", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: /senior software engineer/i }));
    fireEvent.click(screen.getByText("Product Manager"));
    expect(
      screen.getByRole("button", { name: /product manager/i })
    ).toBeInTheDocument();
  });

  it("selects a third job (UX Designer)", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: /senior software engineer/i }));
    fireEvent.click(screen.getByText("UX Designer"));
    expect(
      screen.getByRole("button", { name: /ux designer/i })
    ).toBeInTheDocument();
  });
});

// ── ranking mode toggle ───────────────────────────────────────────────────────

describe("CandidateEvaluationPage – ranking mode", () => {
  it("switches to manual mode and shows the drag banner", async () => {
    await renderPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByText(/drag-and-drop is active/i)).toBeInTheDocument();
  });

  it("shows Save Order button in manual mode", async () => {
    await renderPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("clicking Save Order does not crash", async () => {
    await renderPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    fireEvent.click(screen.getByRole("button", { name: /save order/i }));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("switches back from manual to SFIA mode", async () => {
    await renderPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    fireEvent.click(screen.getByText("SFIA Ranking"));
    expect(
      screen.getByText(/sorted by sfia relevance score/i)
    ).toBeInTheDocument();
  });
});

// ── show all / show top 20 ────────────────────────────────────────────────────

describe("CandidateEvaluationPage – show all toggle", () => {
  it("shows all candidates when toggle is clicked", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    expect(screen.getByText(/all \d+ candidates/i)).toBeInTheDocument();
  });

  it("reverts to top 20 when toggle is clicked again", async () => {
    await renderPage();
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    fireEvent.click(screen.getByRole("button", { name: /show top 20 only/i }));
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
  });
});

// ── candidate card expand / collapse ─────────────────────────────────────────

describe("CandidateEvaluationPage – card expand", () => {
  it("expands a candidate card to reveal the demand vs supply visualization", async () => {
    const { container } = await renderPage();
    const expandBtns = getExpandButtons(container);
    expect(expandBtns.length).toBeGreaterThan(0);
    fireEvent.click(expandBtns[0]);
    expect(
      screen.getByText(/demand vs supply skill match/i)
    ).toBeInTheDocument();
  });

  it("collapses the card when the toggle is clicked again", async () => {
    const { container } = await renderPage();
    const expandBtns = getExpandButtons(container);
    fireEvent.click(expandBtns[0]);
    expect(screen.getByText(/demand vs supply skill match/i)).toBeInTheDocument();
    fireEvent.click(expandBtns[0]);
    expect(screen.queryByText(/demand vs supply skill match/i)).not.toBeInTheDocument();
  });
});

// ── drag-and-drop (manual mode) ───────────────────────────────────────────────

describe("CandidateEvaluationPage – drag and drop", () => {
  it("enables manual mode and maintains the manual ranking UI", async () => {
    await renderPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByText(/manual mode/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("toggles manual mode without crashing", async () => {
    await renderPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    fireEvent.click(screen.getByText("SFIA Ranking"));
    expect(screen.getByText(/sorted by sfia relevance score/i)).toBeInTheDocument();
  });
});
