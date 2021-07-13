import { Publisher, OrderCancelledEvent, Subjects } from '@tm-ticketing/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}