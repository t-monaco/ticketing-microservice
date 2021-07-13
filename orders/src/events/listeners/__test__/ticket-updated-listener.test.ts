import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedEvent } from '@tm-ticketing/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create instance of listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Test title',
        price: 22,
    });
    await ticket.save();

    // cerate a fake data event
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'New test title',
        price: 33,
        userId: mongoose.Types.ObjectId().toHexString(),
    };

    // create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { ticket, listener, data, msg };
};

it('finds, updates and saves a ticket', async () => {
    const { ticket, listener, data, msg } = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    // write assertions to meke sure the ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();
    // call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    // write assetion to make sure that ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('checks that ack methods is NOT call if a version error occurs', async () => {
    const { ticket, listener, data, msg } = await setup();
    // Set version to throw an error
    data.version = 9;

    try {
        await listener.onMessage(data, msg);
    } catch (error) {}

    expect(msg.ack).not.toHaveBeenCalled();
});
