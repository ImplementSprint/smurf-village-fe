import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import CandidateEvaluationPage from "./page";
import {
  getCandidateJobs,
  getRankedCandidates,
  saveManualRanking,
} from "@/lib/candidateApi";

jest.mock("@/lib/candidateApi", () => ({
  getCandidateJobs: jest.fn(),
  getRankedCandidates: jest.fn(),
  saveManualRanking: jest.fn(),
}));

const mockedGetCandidateJobs = jest.mocked(getCandidateJobs);
const mockedGetRankedCandidates = jest.mocked(getRankedCandidates);
const mockedSaveManualRanking = jest.mocked(saveManualRanking);

const MOCK_JOBS = [
  {
    job_posting_id: "job-1",
    title: "Senior Software Engineer",
    department_id: "dep-1",
    status: "open",
    location: "Remote",
    closes_at: null,
    total_candidates: 24,
  },
  {
    job_posting_id: "job-2",
    title: "Product Manager",
    department_id: "dep-2",
    status: "open",
    location: "Manila",
    closes_at: null,
    total_candidates: 24,
  },
  {
    job_posting_id: "job-3",
    title: "UX Designer",
    department_id: "dep-3",
    status: "open",
    location: "Cebu",
    closes_at: null,
    total_candidates: 24,
  },
];

const MOCK_CANDIDATES = Array.from({ length: 24 }, (_, index) => ({
  application_id: `app-${index + 1}`,
  applicant_id: `candidate-${index + 1}`,
  first_name: `First${index + 1}`,
  last_name: `Last${index + 1}`,
  email: `candidate${index + 1}@example.com`,
  phone_number: null,
  applicant_code: null,
  status: index % 2 === 0 ? "screening" : "technical",
  applied_at: "2026-01-01T00:00:00.000Z",
  sfia_match_percentage: 95 - index,
  sfia_rank: index + 1,
  manual_rank_position: null,
  effective_rank: index + 1,
  skill_breakdown: [
    {
      sfia_skill_id: "skill-1",
      skill_name: "React",
      demand_level: 5,
      supply_level: 4,
      points: 20,
      matched: true,
    },
  ],
}));

async function renderLoadedPage() {
  const utils = render(<CandidateEvaluationPage />);
  await waitForElementToBeRemoved(() => screen.queryByText(/loading candidate dashboard/i));
  await waitFor(() => expect(mockedGetRankedCandidates).toHaveBeenCalled());
  const matches = await screen.findAllByText("First1 Last1");
  expect(matches.length).toBeGreaterThan(0);
  return utils;
}

beforeEach(() => {
  mockedGetCandidateJobs.mockResolvedValue(MOCK_JOBS);
  mockedGetRankedCandidates.mockResolvedValue({
    job_posting_id: "job-1",
    title: "Senior Software Engineer",
    ranking_mode: "sfia",
    total_candidates: MOCK_CANDIDATES.length,
    top_count: 20,
    required_skill_count: 1,
    candidates: MOCK_CANDIDATES,
  });
  mockedSaveManualRanking.mockResolvedValue({
    message: "Saved",
    job_posting_id: "job-1",
    updated_count: MOCK_CANDIDATES.length,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

// ── helpers ──────────────────────────────────────────────────────────────────

/** Returns all expand/collapse toggle buttons (they carry the "shrink-0" class). */
function getExpandButtons(container: HTMLElement) {
  return container.querySelectorAll<HTMLButtonElement>("button.shrink-0");
}

// ── rendering ────────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – rendering", () => {
  it("renders the page heading", async () => {
    await renderLoadedPage();
    expect(
      screen.getByText("Candidate Evaluation Dashboard")
    ).toBeInTheDocument();
  });

  it("shows the default job title in the selector button", async () => {
    await renderLoadedPage();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("shows SFIA mode label by default", async () => {
    await renderLoadedPage();
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
    expect(
      screen.getByText(/sorted by sfia relevance score/i)
    ).toBeInTheDocument();
  });

  it("renders the Top 20 Avg Fit stat block", async () => {
    await renderLoadedPage();
    expect(screen.getByText("Top 20 Avg Fit")).toBeInTheDocument();
  });

  it("renders the three podium (top-3) candidate cards", async () => {
    // Three Trophy icons are rendered inside podium divs — verify via their
    // parent containers which have specific bg classes set by podiumBg().
    const { container } = await renderLoadedPage();
    expect(container.querySelectorAll(".bg-amber-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-slate-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-orange-50").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a 'show all' toggle when there are more than 20 candidates", async () => {
    await renderLoadedPage();
    expect(
      screen.getByRole("button", { name: /show all/i })
    ).toBeInTheDocument();
  });
});

// ── job selector ─────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – job selector", () => {
  it("opens the dropdown when the job button is clicked", async () => {
    await renderLoadedPage();
    const jobBtn = screen.getByRole("button", { name: /senior software engineer/i });
    fireEvent.click(jobBtn);
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("UX Designer")).toBeInTheDocument();
  });

  it("selects a different job and updates the button label", async () => {
    await renderLoadedPage();
    fireEvent.click(screen.getByRole("button", { name: /senior software engineer/i }));
    fireEvent.click(screen.getByText("Product Manager"));
    expect(
      screen.getByRole("button", { name: /product manager/i })
    ).toBeInTheDocument();
  });

  it("selects a third job (UX Designer)", async () => {
    await renderLoadedPage();
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
    await renderLoadedPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByText(/drag-and-drop is active/i)).toBeInTheDocument();
  });

  it("shows Save Order button in manual mode", async () => {
    await renderLoadedPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("clicking Save Order does not crash", async () => {
    await renderLoadedPage();
    fireEvent.click(screen.getByText("Manual Ranking"));
    fireEvent.click(screen.getByRole("button", { name: /save order/i }));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("switches back from manual to SFIA mode", async () => {
    await renderLoadedPage();
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
    await renderLoadedPage();
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    expect(screen.getByText(/all \d+ candidates/i)).toBeInTheDocument();
  });

  it("reverts to top 20 when toggle is clicked again", async () => {
    await renderLoadedPage();
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    fireEvent.click(screen.getByRole("button", { name: /show top 20 only/i }));
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
  });
});

// ── candidate card expand / collapse ─────────────────────────────────────────

describe("CandidateEvaluationPage – card expand", () => {
  it("expands a candidate card to reveal SFIA pillar visualization", async () => {
    const { container } = await renderLoadedPage();
    const expandBtns = getExpandButtons(container);
    expect(expandBtns.length).toBeGreaterThan(0);
    fireEvent.click(expandBtns[0]);
    expect(
      screen.getByText(/demand vs supply skill match/i)
    ).toBeInTheDocument();
  });

  it("collapses the card when the toggle is clicked again", async () => {
    const { container } = await renderLoadedPage();
    const expandBtns = getExpandButtons(container);
    fireEvent.click(expandBtns[0]);
    expect(screen.getByText(/demand vs supply skill match/i)).toBeInTheDocument();
    fireEvent.click(expandBtns[0]);
    expect(screen.queryByText(/demand vs supply skill match/i)).not.toBeInTheDocument();
  });
});

// ── drag-and-drop (manual mode) ───────────────────────────────────────────────

describe("CandidateEvaluationPage – drag and drop", () => {
  it("handles drag start, drag over, drop, and drag end without crashing", async () => {
    const { container } = await renderLoadedPage();
    fireEvent.click(screen.getByText("Manual Ranking"));

    await waitFor(() => {
      expect(container.querySelectorAll("[draggable='true']").length).toBeGreaterThan(1);
    });

    const draggables = container.querySelectorAll<HTMLDivElement>("[draggable='true']");
    expect(draggables.length).toBeGreaterThan(1);

    fireEvent.dragStart(draggables[0]);
    fireEvent.dragOver(draggables[1]);
    fireEvent.drop(draggables[1]);
    fireEvent.dragEnd(draggables[0]);

    // After reorder, the page should still render the list heading
    expect(screen.getByText(/manual mode/i)).toBeInTheDocument();
  });

  it("drag over the same card (no-op drop guard) does not crash", async () => {
    const { container } = await renderLoadedPage();
    fireEvent.click(screen.getByText("Manual Ranking"));

    await waitFor(() => {
      expect(container.querySelectorAll("[draggable='true']").length).toBeGreaterThan(0);
    });

    const draggables = container.querySelectorAll<HTMLDivElement>("[draggable='true']");
    fireEvent.dragStart(draggables[0]);
    fireEvent.drop(draggables[0]); // same index → guarded by dragIndex === toIndex
    fireEvent.dragEnd(draggables[0]);

    expect(screen.getByText(/manual mode/i)).toBeInTheDocument();
  });
});
