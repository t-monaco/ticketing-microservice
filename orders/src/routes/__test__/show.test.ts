import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('fetches the order', async () => {
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 100,
    });
    await ticket.save();

    const user = global.signup();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    const { body: fetchOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(200);

    expect(fetchOrder.id).toEqual(order.id);
});

it('return error if a user request an order that do not own', async () => {
    const ticket = Ticket.build({
        title: 'Test Ticket',
        price: 100,
    });
    await ticket.save();

    const user = global.signup();

    const { body: order } = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .get(`/api/orders/${order.id}`)
        .set('Cookie', global.signup())
        .send()
        .expect(401);

});
