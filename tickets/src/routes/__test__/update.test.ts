import request from 'supertest';
import { app } from '../../app';
import { Ticket } from './../../models/ticket';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';

it('return a 404 if the provided id does not exits', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signup())
        .send({ title: 'Test title', price: 100 })
        .expect(404);
});

it('return a 401 if the user is not authorized', async () => {
    const id = mongoose.Types.ObjectId().toHexString();
    await request(app)
        .put(`/api/tickets/${id}`)
        .send({ title: 'Test title', price: 100 })
        .expect(401);
});

it('return a 401 if the used does not own the ticket', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({ title: 'Test title', price: 100 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', global.signup())
        .send({
            title: 'asdasda',
            price: 11,
        })
        .expect(401);
});

it('return a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signup();

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Test title', price: 100 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: '',
            price: 11,
        })
        .expect(400);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title: 'Test title',
            price: -11,
        })
        .expect(400);
});

it('update ticket if all inputs are valid ', async () => {
    const cookie = global.signup();
    const title = 'New test title';
    const price = 200;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Test title', price: 100 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price,
        })
        .expect(200);

    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send();

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
});

it('publish an event', async () => {
    const cookie = global.signup();
    const title = 'New test title';
    const price = 200;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Test title', price: 100 })
        .expect(201);

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price,
        })
        .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects update if ticket is reserved', async () => {
    const cookie = global.signup();
    const title = 'New test title';
    const price = 200;

    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', cookie)
        .send({ title: 'Test title', price: 100 })
        .expect(201);

    const ticket = await Ticket.findById(response.body.id);

    ticket!.set('orderId', mongoose.Types.ObjectId().toHexString());

    await ticket!.save();

    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie', cookie)
        .send({
            title,
            price,
        })
        .expect(400);
});
