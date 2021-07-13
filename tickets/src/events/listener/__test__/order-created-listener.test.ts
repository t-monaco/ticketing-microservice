import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from '@tm-ticketing/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create instance of listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // cerate and save a ticket
    const ticket = Ticket.build({
        title: 'Test title',
        price: 22,
        userId: mongoose.Types.ObjectId().toHexString(),
    });
    await ticket.save();

    // create fake data event
    const data: OrderCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        userId: mongoose.Types.ObjectId().toHexString(),
        expiresAt: 'foo',
        version: 0,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { ticket, listener, data, msg };
};

it('sets the userId of the ticket', async () => {
    const { ticket, listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the msg', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const publishedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(natsWrapper.client.publish).toHaveBeenCalled()
    expect(data.id).toEqual(publishedData.orderId)
});
