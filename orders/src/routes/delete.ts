import {
    requireAuth,
    NotAuthorizedError,
    NotFoundError,
} from '@tm-ticketing/common';
import express, { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/orders';
import { natsWrapper } from './../nats-wrapper';
import { OrderCancelledPublisher } from './../events/publishers/order-cancelled-publisher';

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

        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        res.status(201).send(order);
    }
);

export { router as deleteOrderRouter };
