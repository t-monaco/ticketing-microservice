import {
    Listener,
    OrderCancelledEvent,
    Subjects,
    NotFoundError,
} from '@tm-ticketing/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from './../publishers/ticket-updated-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        // Find ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket -> Error
        if (!ticket) {
            throw new NotFoundError();
        }

        // Mark ticket as reserved
        ticket.set('orderId', undefined);

        // Save ticket
        await ticket.save();

        // Publish updated:ticket event
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version,
        });

        // ack msg
        msg.ack();
    }
}
