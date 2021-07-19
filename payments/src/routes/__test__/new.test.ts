import { OrderStatus } from '@tm-ticketing/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { stripe } from '../../stripe';

it('returns a 404, when purchasing an orther that does not exits', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'asdasdasd',
            orderId: mongoose.Types.ObjectId().toHexString(),
        })
        .expect(404);
});

it("returns a 401, when current user does not match the order's owner", async () => {
    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: mongoose.Types.ObjectId().toHexString(),
        price: 22,
        status: OrderStatus.Created,
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup())
        .send({
            token: 'asdasdasd',
            orderId: order.id,
        })
        .expect(401);
});

it('returns a 400, when purchasing a cancelled order', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: userId,
        price: 22,
        status: OrderStatus.Created,
    });

    order.set('status', OrderStatus.Cancelled);

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup(userId))
        .send({
            token: 'asdasdasd',
            orderId: order.id,
        })
        .expect(400);
});

it('returns a 201 with valid inputs', async () => {
    const userId = mongoose.Types.ObjectId().toHexString();
    const price = Math.floor(Math.random() * 100000);

    const order = Order.build({
        id: mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: userId,
        price,
        status: OrderStatus.Created,
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signup(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id,
        })
        .expect(201);

    const stripeCharges = await stripe.charges.list({ limit: 50 });

    const stripeCharge = stripeCharges.data.find((charge) => {
        return charge.amount === price * 100;
    });

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    })

    expect(stripeCharge).toBeDefined();
    expect(stripeCharge!.amount).toEqual(price * 100);
    expect(stripeCharge!.currency).toEqual('usd');

    expect(payment).not.toBeNull()
});
