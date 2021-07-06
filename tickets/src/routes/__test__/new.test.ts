import request from 'supertest';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from './../../models/ticket';

it('has a route handler listening to api/tickets for post requests', async () => {
    const response = await request(app).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns a status other that 401 if the user is signed in', async () => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({});

    expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({ title: '', price: 100 })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({ price: 100 })
        .expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({ title: 'Test title', price: -100 })
        .expect(400);

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({ title: 'Test title' })
        .expect(400);
});

it('creates a ticket with valid parameters', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'Test Title';

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({ title, price: 100 })
        .expect(201);

    tickets = await Ticket.find({});

    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(100);
});

it('publish an event', async () => {
    const title = 'Test Title';

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signup())
        .send({ title, price: 100 })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled()        
})
