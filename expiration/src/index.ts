import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { natsWrapper } from './nats-wrapper';

const start = async () => {
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID key must be defined!');
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID key must be defined!');
    }
    if (!process.env.NATS_URL) {
        throw new Error('NATS_URL key must be defined!');
    }

    try {
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL
        );
        natsWrapper.client.on('close', () => {
            console.log('Closing NATS connection');
            process.exit();
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        // --- Listeners ---
        new OrderCreatedListener(natsWrapper.client).listen();
        // ---
    } catch (error) {
        console.log(error);
    }
};

start();
