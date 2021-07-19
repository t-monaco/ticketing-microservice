import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { ExpirationCompletedEvent, OrderStatus } from '@tm-ticketing/common';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompletedListener } from '../expiration-completed-listener';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
    // Create instance of listener
    const listener = new ExpirationCompletedListener(natsWrapper.client);
    // Create a ticket and an order
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Test Titlte',
        price: 22,
    });
    await ticket.save();

    const order = Order.build({
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: new Date(),
        ticket,
    });
    await order.save();

    // cerate a fake data event
    const data: ExpirationCompletedEvent['data'] = {
        orderId: order.id,
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { ticket, order, listener, data, msg };
};

it('updates the order status to cancelled', async () => {
    const { order, listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits order:cancelled event', async () => {
    const { order, listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const publishedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(natsWrapper.client.publish).toHaveBeenCalled();
    expect(publishedData.id).toEqual(order.id);
});

it('acks the msg', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
