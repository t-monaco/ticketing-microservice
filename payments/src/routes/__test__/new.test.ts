import { OrderStatus } from '@tm-ticketing/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';

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
