import { Publisher, OrderCreatedEvent, Subjects } from '@tm-ticketing/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated
}