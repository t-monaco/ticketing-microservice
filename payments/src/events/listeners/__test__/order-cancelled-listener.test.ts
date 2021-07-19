import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
    OrderCancelledEvent,
    OrderCreatedEvent,
    OrderStatus,
} from '@tm-ticketing/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 22,
        userId: mongoose.Types.ObjectId().toHexString(),
        version: 0,
    });

    await order.save();

    const data: OrderCancelledEvent['data'] = {
        id: order.id,
        version: order.version + 1,
        ticket: {
            id: mongoose.Types.ObjectId().toHexString(),
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { order, listener, data, msg };
};

it('updates the status of the order', async () => {
    const { order, listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

// it('publishes a ticket updated event', async () => {
//     const { listener, data, msg } = await setup();

//     await listener.onMessage(data, msg);

//     const publishedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

//     expect(natsWrapper.client.publish).toHaveBeenCalled()
//     expect(data.id).toEqual(publishedData.orderId)
// });
