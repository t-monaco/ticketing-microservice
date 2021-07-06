import { Publisher, Subjects, TicketUpdatedEvent } from '@tm-ticketing/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
