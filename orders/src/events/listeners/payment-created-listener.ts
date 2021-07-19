import { queueGroupName } from './queue-group-name';
import {
    Listener,
    NotFoundError,
    OrderStatus,
    PaymentCreatedEvent,
    Subjects,
} from '@tm-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId);

        if (!order) {
            throw new NotFoundError();
        }

        order.set('status', OrderStatus.Completed);

        await order.save()

        msg.ack()
    }
}
