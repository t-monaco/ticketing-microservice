import request from 'supertest';
import { app } from './../../app';

it('returns a 200 and set cookie after successful signin', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});

it('returns a 400 when password do not match', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(201);

    await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'wrong-password',
        })
        .expect(400);
});

it('returns a 400 when email does not exist', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@test.com',
            password: 'password',
        })
        .expect(400);
});
