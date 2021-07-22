import React from 'react';

const ShowOrders = ({ orders }) => {
    return (
        <div>
            <ul>
                {orders.map((order) => (
                    <li>
                        {order.ticket.title} - {order.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

ShowOrders.getInitialProps = async (context, client) => {
    const { data } = await client.get('/api/orders');

    return { orders: data };
};

export default ShowOrders;
