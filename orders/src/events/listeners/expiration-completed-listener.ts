import { Message } from 'node-nats-streaming';
import {
    ExpirationCompletedEvent,
    Listener,
    NotFoundError,
    OrderStatus,
    Subjects,
} from '@tm-ticketing/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/orders';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';

export class ExpirationCompletedListener extends Listener<ExpirationCompletedEvent> {
    subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted;
    queueGroupName = queueGroupName;
    async onMessage(data: ExpirationCompletedEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if (!order) {
            throw new NotFoundError();
        }

        if(order.status === OrderStatus.Complete){
            return msg.ack()
        }

        order.set('status', OrderStatus.Cancelled);

        await order.save();

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        msg.ack()
    }
}