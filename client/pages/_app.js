import 'bootstrap/dist/css/bootstrap.css';
import Header from '../components/header/header.component';
import buildClient from '../api/build-client';

const AppComponent = ({ Component, pageProps }) => {
    return (
        <div>
            <Header {...pageProps} />
            <Component {...pageProps} />
        </div>
    );
};

AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentUser');

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx);
    }

    console.log('app', data);
    console.log('pageprops', pageProps);
    return {
        pageProps,
        ...data,
    };
};

export default AppComponent;
