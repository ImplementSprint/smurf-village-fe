/**
 * React Hooks tests
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useState, useEffect, useCallback, useRef } from 'react';

describe('React Hooks', () => {
  describe('useState Hook', () => {
    it('should manage state correctly', () => {
      const useCounter = () => {
        const [count, setCount] = useState(0);
        return { count, increment: () => setCount((c) => c + 1), decrement: () => setCount((c) => c - 1) };
      };

      const { result } = renderHook(() => useCounter());
      expect(result.current.count).toBe(0);

      act(() => {
        result.current.increment();
      });
      expect(result.current.count).toBe(1);

      act(() => {
        result.current.decrement();
      });
      expect(result.current.count).toBe(0);
    });

    it('should handle multiple state variables', () => {
      const useMultipleState = () => {
        const [name, setName] = useState('John');
        const [age, setAge] = useState(30);
        return { name, setName, age, setAge };
      };

      const { result } = renderHook(() => useMultipleState());
      expect(result.current.name).toBe('John');
      expect(result.current.age).toBe(30);

      act(() => {
        result.current.setName('Jane');
      });
      expect(result.current.name).toBe('Jane');
    });

    it('should handle state with objects', () => {
      const useObjectState = () => {
        const [user, setUser] = useState({ name: 'John', email: 'john@example.com' });
        return {
          user,
          updateName: (name: string) => setUser((u) => ({ ...u, name })),
          updateEmail: (email: string) => setUser((u) => ({ ...u, email })),
        };
      };

      const { result } = renderHook(() => useObjectState());
      expect(result.current.user.name).toBe('John');

      act(() => {
        result.current.updateName('Jane');
      });
      expect(result.current.user.name).toBe('Jane');
      expect(result.current.user.email).toBe('john@example.com');
    });
  });

  describe('useEffect Hook', () => {
    it('should handle side effects', () => {
      const useEffectTest = () => {
        const [count, setCount] = useState(0);
        const [doubleCount, setDoubleCount] = useState(0);

        useEffect(() => {
          setDoubleCount(count * 2);
        }, [count]);

        return { count, doubleCount, setCount };
      };

      const { result } = renderHook(() => useEffectTest());
      expect(result.current.doubleCount).toBe(0);

      act(() => {
        result.current.setCount(5);
      });
      expect(result.current.doubleCount).toBe(10);
    });

    it('should run effect only once on mount', () => {
      const useEffectOnce = () => {
        const [loaded, setLoaded] = useState(false);
        useEffect(() => {
          setLoaded(true);
        }, []);
        return loaded;
      };

      const { result } = renderHook(() => useEffectOnce());
      expect(result.current).toBe(true);
    });

    it('should cleanup on unmount', () => {
      const cleanup = jest.fn();
      const useEffectCleanup = () => {
        useEffect(() => {
          return () => cleanup();
        }, []);
      };

      const { unmount } = renderHook(() => useEffectCleanup());
      unmount();
      expect(cleanup).toHaveBeenCalled();
    });
  });

  describe('useCallback Hook', () => {
    it('should memoize callback', () => {
      const useCallbackTest = () => {
        const [count, setCount] = useState(0);
        const callback = useCallback(() => setCount((c) => c + 1), []);
        return { count, callback };
      };

      const { result } = renderHook(() => useCallbackTest());
      const firstCallback = result.current.callback;

      expect(result.current.count).toBe(0);

      act(() => {
        result.current.callback();
      });
      expect(result.current.count).toBe(1);

      const secondCallback = result.current.callback;
      expect(firstCallback).toBe(secondCallback);
    });

    it('should update callback when dependencies change', () => {
      const useCallbackDeps = () => {
        const [count, setCount] = useState(0);
        const callback = useCallback(() => count, [count]);
        return { count, callback, setCount };
      };

      const { result } = renderHook(() => useCallbackDeps());
      expect(result.current.callback()).toBe(0);

      act(() => {
        result.current.setCount(5);
      });
      expect(result.current.callback()).toBe(5);
    });
  });

  describe('useRef Hook', () => {
    it('should persist value across renders', () => {
      const useRefTest = () => {
        const ref = useRef(0);
        const [count, setCount] = useState(0);

        return {
          ref,
          count,
          increment: () => setCount((c) => c + 1),
          incrementRef: () => {
            ref.current += 1;
          },
        };
      };

      const { result } = renderHook(() => useRefTest());
      expect(result.current.ref.current).toBe(0);

      act(() => {
        result.current.incrementRef();
      });
      expect(result.current.ref.current).toBe(1);
    });

    it('should access DOM elements via ref', () => {
      const ref = { current: null };
      ref.current = { value: 'test' };
      expect(ref.current?.value).toBe('test');
    });
  });

  describe('Custom Hooks', () => {
    it('should create custom hook for toggle', () => {
      const useToggle = (initial: boolean = false) => {
        const [state, setState] = useState(initial);
        const toggle = useCallback(() => setState((s) => !s), []);
        return [state, toggle] as const;
      };

      const { result } = renderHook(() => useToggle(false));
      expect(result.current[0]).toBe(false);

      act(() => {
        result.current[1]();
      });
      expect(result.current[0]).toBe(true);

      act(() => {
        result.current[1]();
      });
      expect(result.current[0]).toBe(false);
    });

    it('should create custom hook for previous value', () => {
      const usePrevious = (value: number) => {
        const ref = useRef<number>();
        useEffect(() => {
          ref.current = value;
        }, [value]);
        return ref.current;
      };

      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 1 },
      });
      expect(result.current).toBeUndefined();

      rerender({ value: 2 });
      expect(result.current).toBe(1);

      rerender({ value: 3 });
      expect(result.current).toBe(2);
    });
  });
});
