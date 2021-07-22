import Router from 'next/router';
import { useState } from 'react';
import useRequest from '../../hooks/use-request';

const NewTicket = () => {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0.0);
    const { doRequest, errors } = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: { title, price },
        onSuccess: () => Router.push('/'),
    });

    const onBlur = () => {
        const value = parseFloat(price);

        setPrice(value.toFixed(2));
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        await doRequest();
    };

    return (
        <div>
            <h1>Create a Ticket</h1>
            <form onSubmit={onSubmit}>
                <div className='form-group'>
                    <label>Title</label>
                    <input
                        type='text'
                        className='form-control'
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className='form-group'>
                    <label>Price</label>
                    <input
                        type='number'
                        onBlur={onBlur}
                        className='form-control'
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>
                {errors}
                <button type='submit' className='btn btn-primary'>
                    Submit
                </button>
            </form>
        </div>
    );
};

export default NewTicket;
