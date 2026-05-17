import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

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
    location: "On-site",
    closes_at: null,
  },
];

const mockCandidates = Array.from({ length: 25 }, (_, index) => ({
  application_id: `app-${index + 1}`,
  applicant_id: `candidate-${index + 1}`,
  first_name: `Candidate${index + 1}`,
  last_name: `Test${index + 1}`,
  email: `candidate${index + 1}@example.com`,
  phone_number: null,
  applicant_code: null,
  status: "active",
  applied_at: "2026-01-01T00:00:00Z",
  sfia_match_percentage: 80 + (index % 5),
  sfia_rank: index + 1,
  manual_rank_position: index + 1,
  effective_rank: index + 1,
  skill_breakdown: [
    {
      sfia_skill_id: `skill-${index + 1}`,
      skill_name: "Skill A",
      demand_level: 4,
      supply_level: 3,
      points: 15,
      matched: true,
    },
  ],
}));

const mockRankedCandidatesResponse = {
  job_posting_id: mockJobs[0].job_posting_id,
  title: mockJobs[0].title,
  ranking_mode: "sfia",
  total_candidates: mockCandidates.length,
  top_count: 20,
  required_skill_count: 1,
  candidates: mockCandidates,
};

const mockGetCandidateJobs = jest.fn(async () => mockJobs);
const mockGetRankedCandidates = jest.fn(async () => mockRankedCandidatesResponse);
const mockGetSurveyScore = jest.fn(async () => ({ surveyScore: 90 }));
const mockSaveManualRanking = jest.fn(async () => ({ message: "OK", job_posting_id: mockJobs[0].job_posting_id, updated_count: 0 }));

jest.mock("@/lib/candidateApi", () => ({
  getCandidateJobs: () => mockGetCandidateJobs(),
  getRankedCandidates: (_jobPostingId: string, _mode: unknown, _limit: number) => mockGetRankedCandidates(),
  saveManualRanking: (_jobPostingId: string, _rankings: Array<{ application_id: string; rank: number }>) => mockSaveManualRanking(),
  getSurveyScore: (_applicationId: string) => mockGetSurveyScore(),
}));

import CandidateEvaluationPage from "./page";

async function setupCandidateEvaluationPage() {
  render(<CandidateEvaluationPage />);
  await screen.findByText("Top 20 Candidates");
  await screen.findByRole("button", { name: /show all/i });
}

beforeEach(async () => {
  await setupCandidateEvaluationPage();
});

// ── helpers ──────────────────────────────────────────────────────────────────

/** Returns all expand/collapse toggle buttons (they carry the "shrink-0" class and no aria-label). */
function getExpandButtons(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLButtonElement>("button.shrink-0"),
  ).filter((btn) => !btn.getAttribute("aria-label"));
}

// ── rendering ────────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – rendering", () => {
  it("renders the page heading", () => {
    expect(
      screen.getByText("Candidate Evaluation Dashboard")
    ).toBeInTheDocument();
  });

  it("shows the default job title in the selector button", () => {
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("shows SFIA mode label by default", () => {
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
    expect(
      screen.getByText(/sorted by sfia relevance score/i)
    ).toBeInTheDocument();
  });

  it("renders the Top 20 Avg Fit stat block", () => {
    expect(screen.getByText("Top 20 Avg Fit")).toBeInTheDocument();
  });

  it("renders the three podium (top-3) candidate cards", () => {
    // Three Trophy icons are rendered inside podium divs — verify via their
    // parent containers which have specific bg classes set by podiumBg().
    const container = document.body;
    expect(container.querySelectorAll(".bg-amber-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-slate-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-orange-50").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a 'show all' toggle when there are more than 20 candidates", () => {
    expect(
      screen.getByRole("button", { name: /show all/i })
    ).toBeInTheDocument();
  });
});

// ── job selector ─────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – job selector", () => {
  it("opens the dropdown when the job button is clicked", () => {
    const jobBtn = screen.getByRole("button", { name: /senior software engineer/i });
    fireEvent.click(jobBtn);
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("UX Designer")).toBeInTheDocument();
  });

  it("selects a different job and updates the button label", () => {
    fireEvent.click(screen.getByRole("button", { name: /senior software engineer/i }));
    fireEvent.click(screen.getByText("Product Manager"));
    expect(
      screen.getByRole("button", { name: /product manager/i })
    ).toBeInTheDocument();
  });

  it("selects a third job (UX Designer)", () => {
    fireEvent.click(screen.getByRole("button", { name: /senior software engineer/i }));
    fireEvent.click(screen.getByText("UX Designer"));
    expect(
      screen.getByRole("button", { name: /ux designer/i })
    ).toBeInTheDocument();
  });
});

// ── ranking mode toggle ───────────────────────────────────────────────────────

describe("CandidateEvaluationPage – ranking mode", () => {
  it("switches to manual mode and shows the drag banner", () => {
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByText(/drag-and-drop is active/i)).toBeInTheDocument();
  });

  it("shows Save Order button in manual mode", () => {
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("clicking Save Order does not crash", () => {
    fireEvent.click(screen.getByText("Manual Ranking"));
    fireEvent.click(screen.getByRole("button", { name: /save order/i }));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("switches back from manual to SFIA mode", () => {
    fireEvent.click(screen.getByText("Manual Ranking"));
    fireEvent.click(screen.getByText("SFIA Ranking"));
    expect(
      screen.getByText(/sorted by sfia relevance score/i)
    ).toBeInTheDocument();
  });
});

// ── show all / show top 20 ────────────────────────────────────────────────────

describe("CandidateEvaluationPage – show all toggle", () => {
  it("shows all candidates when toggle is clicked", () => {
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    expect(screen.getByText(/all \d+ candidates/i)).toBeInTheDocument();
  });

  it("reverts to top 20 when toggle is clicked again", () => {
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    fireEvent.click(screen.getByRole("button", { name: /show top 20 only/i }));
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
  });
});

// ── candidate card expand / collapse ─────────────────────────────────────────

describe("CandidateEvaluationPage – card expand", () => {
  it("expands a candidate card to reveal SFIA pillar visualization", () => {
    const container = document.body;
    const expandBtns = getExpandButtons(container);
    expect(expandBtns.length).toBeGreaterThan(0);
    fireEvent.click(expandBtns[0]);
    expect(
      screen.getByText(/demand vs supply/i)
    ).toBeInTheDocument();
  });

  it("collapses the card when the toggle is clicked again", () => {
    const container = document.body;
    const expandBtns = getExpandButtons(container);
    fireEvent.click(expandBtns[0]);
    expect(screen.getByText(/demand vs supply/i)).toBeInTheDocument();
    fireEvent.click(expandBtns[0]);
    expect(screen.queryByText(/demand vs supply/i)).not.toBeInTheDocument();
  });
});

// ── drag-and-drop (manual mode) ───────────────────────────────────────────────

describe("CandidateEvaluationPage – drag and drop", () => {
  it("handles drag start, drag over, drop, and drag end without crashing", async () => {
    const container = document.body;
    fireEvent.click(screen.getByText("Manual Ranking"));

    await waitFor(() => {
      const draggables = container.querySelectorAll<HTMLDivElement>("[draggable='true']");
      expect(draggables.length).toBeGreaterThan(1);
    });

    const draggables = container.querySelectorAll<HTMLDivElement>("[draggable='true']");

    fireEvent.dragStart(draggables[0]);
    fireEvent.dragOver(draggables[1]);
    fireEvent.drop(draggables[1]);
    fireEvent.dragEnd(draggables[0]);

    // After reorder, the page should still render the list heading
    expect(screen.getByText(/manual mode/i)).toBeInTheDocument();
  });

  it("drag over the same card (no-op drop guard) does not crash", async () => {
    const container = document.body;
    fireEvent.click(screen.getByText("Manual Ranking"));

    await waitFor(() => {
      const draggables = container.querySelectorAll<HTMLDivElement>("[draggable='true']");
      expect(draggables.length).toBeGreaterThan(0);
    });

    const draggables = container.querySelectorAll<HTMLDivElement>("[draggable='true']");
    fireEvent.dragStart(draggables[0]);
    fireEvent.drop(draggables[0]); // same index → guarded by dragIndex === toIndex
    fireEvent.dragEnd(draggables[0]);

    expect(screen.getByText(/manual mode/i)).toBeInTheDocument();
  });
});
