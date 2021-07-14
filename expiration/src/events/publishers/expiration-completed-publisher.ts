import { Publisher, ExpirationCompletedEvent, Subjects } from "@tm-ticketing/common";

export class ExpirationCompletedPublisher extends Publisher<ExpirationCompletedEvent> {
    subject: Subjects.ExpirationCompleted = Subjects.ExpirationCompleted
}