import { Message } from 'node-nats-streaming';
import {
    Listener,
    NotFoundError,
    Subjects,
    TicketUpdatedEvent,
} from '@tm-ticketing/common';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {

        const { title, price } = data;

        const ticket = await Ticket.findByEvent(data);

        if (!ticket) {
            throw new NotFoundError();
        }

        ticket.set({ title, price });
        await ticket.save();

        msg.ack();
    }
}
