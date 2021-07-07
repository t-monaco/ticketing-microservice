import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Order, OrderStatus } from '../../models/orders';
import { Ticket } from '../../models/ticket';

it('returns error if the ticket does not exist', async () => {
    const ticketId = mongoose.Types.ObjectId();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ ticketId })
        .expect(404);
});

it('returns error if the ticket is already reserved', async () => {
    const ticket = Ticket.build({
        title: 'Test title',
        price: 100,
    });
    await ticket.save();

    const order = Order.build({
        ticket,
        userId: 'asdasdad',
        status: OrderStatus.Created,
        expiresAt: new Date(),
    });
    await order.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ ticketId: ticket.id })
        .expect(400);
});

it('reserves the ticket', async () => {
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 100,
    });
    await ticket.save();

    await request(app)
        .post('/api/orders')
        .set('Cookie', global.signup())
        .send({ ticketId: ticket.id })
        .expect(201);
});

it.todo('emits an event after creating an order')