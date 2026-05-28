import { render, screen } from "@testing-library/react";
import { TimekeepingHeader, DayStatRow, PeriodStatRow } from "@/components/timekeeping/TimekeepingHeader";

describe("timekeeping header primitives", () => {
  it("renders the shared header", () => {
    render(<TimekeepingHeader liveTime="08:30 AM" />);
    expect(screen.getByText("Timekeeping")).toBeInTheDocument();
    expect(screen.getByText("08:30 AM")).toBeInTheDocument();
  });

  it("renders the day and period stat rows", () => {
    render(
      <div>
        <DayStatRow
          total={10}
          inCount={8}
          late={2}
          absent={0}
          totalHours={64}
          rate={80}
          dayStarted
          firstShiftLabel="08:00 AM"
        />
        <PeriodStatRow
          total={10}
          totalHours={64}
          avgHours={8}
          avgCompliance={85}
          flaggedCount={1}
          periodLabel="This Week"
        />
      </div>,
    );

    expect(screen.getByText("tracked")).toBeInTheDocument();
    expect(screen.getByText("employees")).toBeInTheDocument();
    expect(screen.getByText("flagged")).toBeInTheDocument();
  });
});
