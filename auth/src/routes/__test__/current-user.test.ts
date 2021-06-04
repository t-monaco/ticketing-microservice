import request from 'supertest';
import { app } from './../../app';

it('respond with details about the current user', async () => {
     const cookie = await global.signup()

    const response = await request(app)
        .get('/api/users/currentuser')
        .set('Cookie', cookie)
        .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('respond with <null> if not authenticated', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .expect(200);

    expect(response.body.currentUser).toEqual(null);
});
