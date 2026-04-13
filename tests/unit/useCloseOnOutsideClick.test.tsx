import { useRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { useCloseOnOutsideClick } from "../../src/lib/useCloseOnOutsideClick";

function Fixture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useCloseOnOutsideClick({
    open,
    refs: [triggerRef, panelRef],
    onClose,
  });

  return (
    <div>
      <button ref={triggerRef} data-testid="trigger">Trigger</button>
      <div ref={panelRef} data-testid="panel">Panel</div>
      <div data-testid="outside">Outside</div>
    </div>
  );
}

describe("useCloseOnOutsideClick", () => {
  it("closes when clicking outside referenced elements", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<Fixture open onClose={onClose} />);

    fireEvent.mouseDown(getByTestId("outside"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside referenced elements", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<Fixture open onClose={onClose} />);

    fireEvent.mouseDown(getByTestId("trigger"));
    fireEvent.mouseDown(getByTestId("panel"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not attach behavior when closed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(<Fixture open={false} onClose={onClose} />);

    fireEvent.mouseDown(getByTestId("outside"));

    expect(onClose).not.toHaveBeenCalled();
  });
});