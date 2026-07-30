/**
 * Seeded Random Number Generator using Mulberry32 algorithm
 *
 * Provides deterministic random number generation for game logic.
 * This ensures:
 * - Server-authoritative randomness (no client manipulation)
 * - Replay capability (same seed = same sequence)
 * - Prevents timing-based attacks
 */
export class SeededRNG {
  private seed: number;

  constructor(seedString: string) {
    // Convert string to 32-bit integer seed
    this.seed = this.hashString(seedString);
  }

  /**
   * Hash a string to a 32-bit integer (simple hash function)
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Generate next random number between 0 and 1 (Mulberry32 algorithm)
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Shuffle an array in-place using Fisher-Yates algorithm
   */
  shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Pick a random element from an array
   */
  choice<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }

  /**
   * Pick N random elements from an array (without replacement)
   */
  sample<T>(array: T[], count: number): T[] {
    if (count >= array.length) {
      const copy = [...array];
      this.shuffle(copy);
      return copy;
    }

    const result: T[] = [];
    const indices = new Set<number>();

    while (result.length < count) {
      const index = this.nextInt(0, array.length - 1);
      if (!indices.has(index)) {
        indices.add(index);
        result.push(array[index]);
      }
    }

    return result;
  }

  /**
   * Generate boolean with given probability (0.0 to 1.0)
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}
