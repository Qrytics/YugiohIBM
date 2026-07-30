"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeededRNG = void 0;
class SeededRNG {
    seed;
    constructor(seedString) {
        this.seed = this.hashString(seedString);
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    next() {
        let t = (this.seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i);
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    choice(array) {
        if (array.length === 0)
            return undefined;
        const index = this.nextInt(0, array.length - 1);
        return array[index];
    }
    sample(array, count) {
        if (count >= array.length) {
            const copy = [...array];
            this.shuffle(copy);
            return copy;
        }
        const result = [];
        const indices = new Set();
        while (result.length < count) {
            const index = this.nextInt(0, array.length - 1);
            if (!indices.has(index)) {
                indices.add(index);
                result.push(array[index]);
            }
        }
        return result;
    }
    chance(probability) {
        return this.next() < probability;
    }
}
exports.SeededRNG = SeededRNG;
//# sourceMappingURL=SeededRNG.js.map