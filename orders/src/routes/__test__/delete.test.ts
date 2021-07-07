import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Order, OrderStatus } from '../../models/orders';
import { Ticket } from '../../models/ticket';

it('marks order as cancel', async () => {
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
        .patch(`/api/orders/${order.id}`)
        .set('Cookie', user)
        .send()
        .expect(201);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo('emits an order:cancelled event')