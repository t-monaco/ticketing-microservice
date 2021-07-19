import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signup(id?: string): string[];
        }
    }
}

jest.mock('./../nats-wrapper.ts');

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = 'only_for_testing';

    mongo = new MongoMemoryServer();
    const mongoUri = await mongo.getUri();

    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signup = (id?:string) => {
    // Build a JWT payload. {id, email}
    const payload = {
        id: id || new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com',
    };

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object
    const session = { jwt: token };

    // Turn sesion into JSON
    const sessionJSON = JSON.stringify(session);

    // Encode to Base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string with the enconded data;
    return [`express:sess=${base64}`];
};
