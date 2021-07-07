import {
    requireAuth,
    NotAuthorizedError,
    NotFoundError,
} from '@tm-ticketing/common';
import express, { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/orders';

const router = express.Router();

router.patch(
    '/api/orders/:orderId',
    requireAuth,
    async (req: Request, res: Response) => {
        const { orderId } = req.params;
        const order = await Order.findById(orderId).populate('ticket');

        if (!order) throw new NotFoundError();

        if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError();

        order.status = OrderStatus.Cancelled
        order.save();

        res.status(201).send(order);
    }
);

export { router as deleteOrderRouter };
