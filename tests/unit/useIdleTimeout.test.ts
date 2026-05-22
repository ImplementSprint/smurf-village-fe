import { act, cleanup, render } from "@testing-library/react"
import { createElement } from "react"
import { useIdleTimeout } from "../../src/lib/useIdleTimeout"

afterEach(() => {
  cleanup()
  jest.useRealTimers()
})

describe("useIdleTimeout", () => {
  function IdleComponent({ onIdle, enabled }: { onIdle: () => void; enabled: boolean }) {
    useIdleTimeout(onIdle, enabled)
    return null
  }

  it("calls onIdle after the idle timeout when enabled", () => {
    jest.useFakeTimers()
    const onIdle = jest.fn()

    act(() => {
      render(createElement(IdleComponent, { onIdle, enabled: true }))
    })

    expect(onIdle).not.toHaveBeenCalled()

    act(() => {
      globalThis.dispatchEvent(new Event("mousemove"))
      jest.advanceTimersByTime(30 * 60 * 1000)
    })

    expect(onIdle).toHaveBeenCalledTimes(1)
  })

  it("does not call onIdle when disabled", () => {
    jest.useFakeTimers()
    const onIdle = jest.fn()

    act(() => {
      render(createElement(IdleComponent, { onIdle, enabled: false }))
    })

    act(() => {
      jest.advanceTimersByTime(30 * 60 * 1000)
    })

    expect(onIdle).not.toHaveBeenCalled()
  })
})
