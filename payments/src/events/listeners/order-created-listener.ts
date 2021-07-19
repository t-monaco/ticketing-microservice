import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Listener, OrderCreatedEvent, Subjects } from '@tm-ticketing/common';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            price: data.ticket.price,
            userId: data.userId,
            version: data.version,
            status: data.status,
        });

        await order.save();

        msg.ack();
    }
}
