import mongoose from 'mongoose'; import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@tm-ticketing/common';

interface OrderAttrs {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            require: true,
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatus),
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
            },
        },
        versionKey: 'version',
    }
);

OrderSchema.plugin(updateIfCurrentPlugin);

OrderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        ...attrs,
        _id: attrs.id
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', OrderSchema);

export {Order}