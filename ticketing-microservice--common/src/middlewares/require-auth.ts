import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../errors/not-authorized-error';

// * After running this middleware, currentUser middleware should be ran before.

export const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }

    next();
};
