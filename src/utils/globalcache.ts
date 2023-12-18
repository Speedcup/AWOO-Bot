export { Cache, CacheObjectType };
export { channel_cache };

/*
    Represents an cache object type.
*/
type CacheObjectType<T> = { [key: string]: T }

class Cache<T> {
    protected cache: { [key: string]: T } = {};

    constructor(
        private maxItems: number = 100,
        private ttl?: number,
    ) {}

    getAll(): { [p: string]: T } {
        return this.cache
    }

    get(key: string): T | undefined {
        return this.cache[key];
    }

    set(key: string, value: T): void {
        this.cache[key] = value;
    }

    del(key: string): void {
        if (this.get(key)) {
            delete this.cache[key];
        }
    }

    pop(key: string): void {
        return this.del(key);
    }

    update(table: { [index: string]: T }): void {
        const keys = Object.keys(table);
        keys.forEach((key) => {
            const value = table[key];
            this.set(key, value);
        })
    }

    length(): number {
        const keys = Object.keys(this.cache);
        return keys.length;
    }

    find(callback: Function): T | null {
        for (const key in this.cache) {
            const value: T = this.cache[key];
            if (callback(value)) {
                return value;
            }
        }

        return null;
    }

    [Symbol.iterator](): Iterator<[string, T]> {
        const keys = Object.keys(this.cache);
        let index = 0;

        return {
            next: (): IteratorResult<[string, T]> => {
                if (index < keys.length) {
                    const key = keys[index++];
                    return {
                        value: [key, this.cache[key]],
                        done: false,
                    };
                } else {
                    return {
                        value: undefined,
                        done: true,
                    };
                }
            },
        };
    }
}

const channel_cache = new Cache<string>();