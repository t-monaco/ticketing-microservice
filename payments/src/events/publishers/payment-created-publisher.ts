import { PaymentCreatedEvent, Publisher, Subjects } from '@tm-ticketing/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
