export abstract class CustomError extends Error {
    abstract statusCode: number;

    constructor(message: string) {
        super();

        // Only for build in class inheritance
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    abstract serializeErrors(): { message: string; field?: string }[];
}
