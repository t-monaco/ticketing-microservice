import Queue from 'bull';
import { ExpirationCompletedPublisher } from '../events/publishers/expiration-completed-publisher';
import { natsWrapper } from '../nats-wrapper';

interface Payload {
    orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
    redis: {
        host: process.env.REDIS_HOST,
    },
});

expirationQueue.process(async (job) => {
    new ExpirationCompletedPublisher(natsWrapper.client).publish({
        orderId: job.data.orderId,
    });
    console.log(
        'I want to publish expiration:complete event',
        job.data.orderId
    );
});

export { expirationQueue };
