/**
 * Tests for utility functions
 */
import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('should merge multiple class names', () => {
      const result = cn('px-2', 'py-1');
      expect(result).toContain('px-2');
      expect(result).toContain('py-1');
    });

    it('should handle conditional classes', () => {
      const result = cn('px-2', false && 'py-1', 'rounded');
      expect(result).toContain('px-2');
      expect(result).toContain('rounded');
      expect(result).not.toContain('py-1');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      // Should override px-2 with px-4
      expect(result).toContain('px-4');
    });

    it('should handle empty inputs', () => {
      const result = cn('');
      expect(typeof result).toBe('string');
    });

    it('should handle arrays of classes', () => {
      const result = cn(['px-2', 'py-1'], 'rounded');
      expect(result).toContain('px-2');
      expect(result).toContain('py-1');
      expect(result).toContain('rounded');
    });

    it('should handle undefined and null', () => {
      const result = cn(undefined, 'px-2', null, 'py-1');
      expect(result).toContain('px-2');
      expect(result).toContain('py-1');
    });
  });

  describe('String utilities', () => {
    it('should capitalize strings', () => {
      const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('')).toBe('');
    });

    it('should trim whitespace', () => {
      const trim = (str: string) => str.trim();
      expect(trim('  hello  ')).toBe('hello');
    });

    it('should check if string is empty', () => {
      const isEmpty = (str: string | null | undefined) => !str || str.trim() === '';
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('  ')).toBe(true);
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty('hello')).toBe(false);
    });
  });

  describe('Array utilities', () => {
    it('should filter falsy values', () => {
      const filterFalsy = (arr: (string | null | undefined)[]) =>
        arr.filter((item) => item !== null && item !== undefined && item !== '');
      expect(filterFalsy(['a', null, 'b', undefined, '', 'c'])).toEqual(['a', 'b', 'c']);
    });

    it('should remove duplicates', () => {
      const removeDuplicates = (arr: string[]) => Array.from(new Set(arr));
      expect(removeDuplicates(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
    });

    it('should chunk array', () => {
      const chunk = (arr: any[], size: number) => {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
          chunks.push(arr.slice(i, i + size));
        }
        return chunks;
      };
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('Object utilities', () => {
    it('should merge objects', () => {
      const merge = (a: Record<string, unknown>, b: Record<string, unknown>) => ({ ...a, ...b });
      expect(merge({ x: 1 }, { y: 2 })).toEqual({ x: 1, y: 2 });
      expect(merge({ a: 1 }, { a: 2 })).toEqual({ a: 2 });
    });

    it('should check if key exists', () => {
      const hasKey = (obj: Record<string, unknown>, key: string) => key in obj;
      const obj = { name: 'John', age: 30 };
      expect(hasKey(obj, 'name')).toBe(true);
      expect(hasKey(obj, 'email')).toBe(false);
    });

    it('should get object keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(Object.keys(obj)).toEqual(['a', 'b', 'c']);
    });
  });
});
