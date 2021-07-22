import Router from 'next/router';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';

const ShowOrder = ({ currentUser, order }) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const { doRequest, errors } = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id,
        },
        onSuccess: () => Router.push('/orders'),
    });

    useEffect(() => {
        const calcTimeleft = () => {
            const msLetf = new Date(order.expiresAt) - new Date();
            setTimeLeft(Math.round(msLetf / 1000));
        };

        calcTimeleft();
        const timerId = setInterval(calcTimeleft, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);

    return (
        <div>
            {timeLeft > 0 ? (
                <div>
                    <h1>ORDER</h1>
                    <h1>{order.id}</h1>
                    <h4>You have {timeLeft} seconds to purchase the order</h4>
                    <StripeCheckout
                        token={({ id }) => doRequest({ token: id })}
                        stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
                        amount={order.price * 100}
                        email={currentUser.email}
                    />
                    {errors}
                </div>
            ) : (
                <div>ORDER EXPIRED</div>
            )}
        </div>
    );
};

ShowOrder.getInitialProps = async (context, client) => {
    const { orderId } = context.query;

    const { data } = await client.get(`/api/orders/${orderId}`);

    return { order: data };
};

export default ShowOrder;
