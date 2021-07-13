import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@tm-ticketing/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../ticket-created-listener';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create instance of listener
    const listener = new TicketCreatedListener(natsWrapper.client);
    // cerate a fake data event
    const data: TicketCreatedEvent['data'] = {
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'Test title',
        price: 11,
        userId: mongoose.Types.ObjectId().toHexString(),
    };
    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, data, msg };
};

it('creates and save a ticket', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    // write assertions to meke sure the ticket was created
    const ticket = Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(data.title).toEqual(data.title);
    expect(data.price).toEqual(data.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    // write assetion to make sure that ack function was called
    expect(msg.ack).toHaveBeenCalled()
});
