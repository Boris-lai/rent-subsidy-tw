import { describe, expect, it } from 'vitest';

describe('vitest smoke', () => {
  it('runs basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('resolves @/ path alias', async () => {
    const { cn } = await import('@/lib/utils');
    expect(cn('a', 'b')).toBe('a b');
  });
});
