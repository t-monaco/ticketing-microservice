import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    console.log('Starting up...')
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY key must be defined!');
    }
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI key must be defined!');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
        });

        console.log('DB connected');
    } catch (error) {
        console.log(error);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!');
    });
};

start();
