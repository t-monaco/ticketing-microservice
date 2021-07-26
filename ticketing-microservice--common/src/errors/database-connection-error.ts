import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
    statusCode = 500;
    reason = 'Error connecting to databse';

    constructor() {
        super('Error connecting to DB');

        // Only for build in class inheritance
        Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
    }

    serializeErrors() {
        return [
            {
                message: this.reason,
            },
        ];
    }
}
