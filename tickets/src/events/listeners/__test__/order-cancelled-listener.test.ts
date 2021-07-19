import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@tm-ticketing/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create instance of listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    // cerate and save a ticket
    const ticket = Ticket.build({
        title: 'Test title',
        price: 22,
        userId: mongoose.Types.ObjectId().toHexString(),
    });

    const orderId = mongoose.Types.ObjectId().toHexString();
    ticket.set({ orderId });

    await ticket.save();

    // create fake data event
    const data: OrderCancelledEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        ticket: {
            id: ticket.id,
        },
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { ticket, orderId, listener, data, msg };
};

it('updates the ticket orderId to undefined ', async () => {
    const { ticket, listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toBeUndefined();
});

it('pbulsihes the event ', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('acks the msg ', async () => {
    const { ticket, listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
