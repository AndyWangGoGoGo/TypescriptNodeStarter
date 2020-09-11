class RandomCode {
    private static _instance: RandomCode;
    public static get Instance(): RandomCode {
        if (!this._instance) {
            this._instance = new RandomCode();
        }
        return this._instance;
    }

    // private static readonly _chars: string = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private readonly _chars: string = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

    private getRandomInt = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    /**
     * Return a unique identifier with the given len.
     *
     * @param {Number} length
     * @return {String}
     */
    public generateCode = (length: number): string => {
        let resultCode = "";
        const max = this._chars.length;
        for (let i = 0; i < length; i++) {
            const index = this.getRandomInt(0, max);
            resultCode += this._chars[index];
        }
        return resultCode;
    }
}

export const Random = RandomCode.Instance;