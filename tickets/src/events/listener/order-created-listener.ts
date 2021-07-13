import {
    Listener,
    OrderCreatedEvent,
    Subjects,
    NotFoundError,
} from '@tm-ticketing/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { TicketUpdatedPublisher } from './../publishers/ticket-updated-publisher';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from './../../nats-wrapper';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        // Find ticket that the order is reserving
        const ticket = await Ticket.findById(data.ticket.id);

        // If no ticket -> Error
        if (!ticket) {
            throw new NotFoundError();
        }

        // Mark ticket as reserved
        ticket.set('orderId', data.id);

        // Save ticket
        await ticket.save();

        // Publish updated:ticket event
        await  new TicketUpdatedPublisher(this.client).publish({
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
