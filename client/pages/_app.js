// import 'bootstrap/dist/css/bootstrap.css';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import Header from '../components/header/header.component';
import buildClient from '../api/build-client';
import Head from 'next/head'

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;400;600;800&display=swap" rel="stylesheet" />
            </Head>
            <GlobalStyle />
            <Header currentUser={currentUser} />
            <div className='container'>
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentUser');

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(
            appContext.ctx,
            client,
            data.currentUser
        );
    }

    return {
        pageProps,
        ...data,
    };
};

export default AppComponent;

const GlobalStyle = createGlobalStyle`
*{
    box-sizing: border-box;
    font-family: 'Nunito', sans-serif;
    margin: 0 auto;
    padding: 0;
}

li {
    list-style: none;
}

a {
    text-decoration: none;
}
`;
