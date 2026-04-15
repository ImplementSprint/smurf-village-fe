import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CandidateEvaluationPage from "./page";

jest.mock("../../../../lib/candidateApi", () => {
  const jobs = [
    {
      job_posting_id: "job-1",
      title: "Senior Software Engineer",
      department_id: null,
      status: "open",
      location: "Remote",
      closes_at: null,
    },
    {
      job_posting_id: "job-2",
      title: "Product Manager",
      department_id: null,
      status: "open",
      location: "Hybrid",
      closes_at: null,
    },
    {
      job_posting_id: "job-3",
      title: "UX Designer",
      department_id: null,
      status: "open",
      location: "Onsite",
      closes_at: null,
    },
  ];

  const candidates = Array.from({ length: 25 }, (_, idx) => ({
    application_id: `app-${idx + 1}`,
    applicant_id: `applicant-${idx + 1}`,
    first_name: `First${idx + 1}`,
    last_name: `Last${idx + 1}`,
    email: `candidate${idx + 1}@example.com`,
    phone_number: null,
    applicant_code: null,
    status: "submitted",
    applied_at: "2026-01-01T00:00:00.000Z",
    sfia_match_percentage: 90 - (idx % 10),
    sfia_rank: idx + 1,
    manual_rank_position: idx + 1,
    effective_rank: idx + 1,
    skill_breakdown: [
      {
        sfia_skill_id: `skill-${idx + 1}`,
        skill_name: "Communication",
        demand_level: 4,
        supply_level: 3,
        points: 8,
        matched: false,
      },
    ],
  }));

  return {
    getCandidateJobs: jest.fn(async () => jobs),
    getRankedCandidates: jest.fn(async () => ({
      job_posting_id: "job-1",
      title: "Senior Software Engineer",
      ranking_mode: "sfia",
      total_candidates: candidates.length,
      top_count: 20,
      required_skill_count: 1,
      candidates,
    })),
    saveManualRanking: jest.fn(async () => ({
      message: "ok",
      job_posting_id: "job-1",
      updated_count: candidates.length,
    })),
  };
});

async function renderReady() {
  render(<CandidateEvaluationPage />);
  await screen.findByText("Candidate Evaluation Dashboard");
  await screen.findByText(/showing 20 of 25 candidates/i);
}

// ── helpers ──────────────────────────────────────────────────────────────────

/** Returns all expand/collapse toggle buttons (they carry the "shrink-0" class). */
function getExpandButtons(container: HTMLElement) {
  return container.querySelectorAll<HTMLButtonElement>("button.shrink-0");
}

// ── rendering ────────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – rendering", () => {
  it("renders the page heading", async () => {
    await renderReady();
    expect(
      screen.getByText("Candidate Evaluation Dashboard")
    ).toBeInTheDocument();
  });

  it("shows the default job title in the selector button", async () => {
    await renderReady();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();
  });

  it("shows SFIA mode label by default", async () => {
    await renderReady();
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
    expect(
      screen.getByText(/sorted by sfia relevance score/i)
    ).toBeInTheDocument();
  });

  it("renders the Top 20 Avg Fit stat block", async () => {
    await renderReady();
    expect(screen.getByText("Top 20 Avg Fit")).toBeInTheDocument();
  });

  it("renders the three podium (top-3) candidate cards", async () => {
    // Three Trophy icons are rendered inside podium divs — verify via their
    // parent containers which have specific bg classes set by podiumBg().
    const { container } = render(<CandidateEvaluationPage />);
    await screen.findByText("Candidate Evaluation Dashboard");
    expect(container.querySelectorAll(".bg-amber-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-slate-100").length).toBeGreaterThanOrEqual(1);
    expect(container.querySelectorAll(".bg-orange-50").length).toBeGreaterThanOrEqual(1);
  });

  it("renders a 'show all' toggle when there are more than 20 candidates", async () => {
    await renderReady();
    expect(
      screen.getByRole("button", { name: /show all/i })
    ).toBeInTheDocument();
  });
});

// ── job selector ─────────────────────────────────────────────────────────────

describe("CandidateEvaluationPage – job selector", () => {
  it("opens the dropdown when the job button is clicked", async () => {
    await renderReady();
    const jobBtn = screen.getByRole("button", { name: /senior software engineer/i });
    fireEvent.click(jobBtn);
    expect(screen.getByText("Product Manager")).toBeInTheDocument();
    expect(screen.getByText("UX Designer")).toBeInTheDocument();
  });

  it("selects a different job and updates the button label", async () => {
    await renderReady();
    fireEvent.click(screen.getByRole("button", { name: /senior software engineer/i }));
    fireEvent.click(screen.getByText("Product Manager"));
    expect(
      screen.getByRole("button", { name: /product manager/i })
    ).toBeInTheDocument();
  });

  it("selects a third job (UX Designer)", async () => {
    await renderReady();
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
    await renderReady();
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByText(/drag-and-drop is active/i)).toBeInTheDocument();
  });

  it("shows Save Order button in manual mode", async () => {
    await renderReady();
    fireEvent.click(screen.getByText("Manual Ranking"));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("clicking Save Order does not crash", async () => {
    await renderReady();
    fireEvent.click(screen.getByText("Manual Ranking"));
    fireEvent.click(screen.getByRole("button", { name: /save order/i }));
    expect(screen.getByRole("button", { name: /save order/i })).toBeInTheDocument();
  });

  it("switches back from manual to SFIA mode", async () => {
    await renderReady();
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
    await renderReady();
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    expect(screen.getByText(/all \d+ candidates/i)).toBeInTheDocument();
  });

  it("reverts to top 20 when toggle is clicked again", async () => {
    await renderReady();
    fireEvent.click(screen.getByRole("button", { name: /show all/i }));
    fireEvent.click(screen.getByRole("button", { name: /show top 20 only/i }));
    expect(screen.getByText("Top 20 Candidates")).toBeInTheDocument();
  });
});

// ── candidate card expand / collapse ─────────────────────────────────────────

describe("CandidateEvaluationPage – card expand", () => {
  it("expands a candidate card to reveal SFIA pillar visualization", async () => {
    const { container } = render(<CandidateEvaluationPage />);
    await screen.findByText("Candidate Evaluation Dashboard");
    const expandBtns = getExpandButtons(container);
    expect(expandBtns.length).toBeGreaterThan(0);
    fireEvent.click(expandBtns[0]);
    expect(
      screen.getByText(/skill demand vs supply/i)
    ).toBeInTheDocument();
  });

  it("collapses the card when the toggle is clicked again", async () => {
    const { container } = render(<CandidateEvaluationPage />);
    await screen.findByText("Candidate Evaluation Dashboard");
    const expandBtns = getExpandButtons(container);
    fireEvent.click(expandBtns[0]);
    expect(screen.getByText(/skill demand vs supply/i)).toBeInTheDocument();
    fireEvent.click(expandBtns[0]);
    expect(screen.queryByText(/skill demand vs supply/i)).not.toBeInTheDocument();
  });
});

// ── drag-and-drop (manual mode) ───────────────────────────────────────────────

describe("CandidateEvaluationPage – drag and drop", () => {
  it("handles drag start, drag over, drop, and drag end without crashing", async () => {
    const { container } = render(<CandidateEvaluationPage />);
    await screen.findByText("Candidate Evaluation Dashboard");
    fireEvent.click(screen.getByText("Manual Ranking"));

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
    const { container } = render(<CandidateEvaluationPage />);
    await screen.findByText("Candidate Evaluation Dashboard");
    fireEvent.click(screen.getByText("Manual Ranking"));

    const draggables = container.querySelectorAll<HTMLDivElement>("[draggable='true']");
    fireEvent.dragStart(draggables[0]);
    fireEvent.drop(draggables[0]); // same index → guarded by dragIndex === toIndex
    fireEvent.dragEnd(draggables[0]);

    expect(screen.getByText(/manual mode/i)).toBeInTheDocument();
  });
});
