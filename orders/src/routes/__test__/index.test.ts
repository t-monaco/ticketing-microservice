import mongoose from 'mongoose'
import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

const buildTicket = async () => {
    const ticket = Ticket.build({
        id: mongoose.Types.ObjectId().toHexString(),
        title: 'Test ticket',
        price: 200,
    });
    await ticket.save();

    return ticket;
};

it('returns error if not authenticate', async () => {
    await request(app).get('/api/orders').send({}).expect(401);
});

it('fetches orders for particular user', async () => {
    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    // User #1
    const userOne = global.signup();
    await request(app)
        .post('/api/orders')
        .set('Cookie', userOne)
        .send({ ticketId: ticketOne.id })
        .expect(201);

    // User #2
    const userTwo = global.signup();
    await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketTwo.id })
        .expect(201);
    await request(app)
        .post('/api/orders')
        .set('Cookie', userTwo)
        .send({ ticketId: ticketThree.id })
        .expect(201);

    const responseUserOne = await request(app)
        .get('/api/orders')
        .set('Cookie', userOne)
        .expect(200);

    const responseUserTwo = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200);

    expect(responseUserOne.body.length).toEqual(1);
    expect(responseUserTwo.body.length).toEqual(2);
});
