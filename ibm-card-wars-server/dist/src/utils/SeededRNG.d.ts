export declare class SeededRNG {
    private seed;
    constructor(seedString: string);
    private hashString;
    next(): number;
    nextInt(min: number, max: number): number;
    shuffle<T>(array: T[]): void;
    choice<T>(array: T[]): T | undefined;
    sample<T>(array: T[], count: number): T[];
    chance(probability: number): boolean;
}
