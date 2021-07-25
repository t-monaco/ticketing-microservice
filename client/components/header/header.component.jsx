import React, { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import breakpoint from '../../_breakpoints';

const Header = ({ currentUser }) => {
    const [showSidebar, setShowSidebar] = useState(false);

    const links = [
        !currentUser && { label: 'Sign Up', href: '/auth/signup' },
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
        currentUser && { label: 'My Orders', href: '/orders' },
        currentUser && { label: 'Sign Out', href: '/auth/signout' },
    ]
        .filter((linkConfig) => linkConfig)
        .map(({ label, href }, key) => {
            return (
                <ListItem key={key} className='nav-item'>
                    <Link href={href}>
                        <a className='nav-link'>{label}</a>
                    </Link>
                </ListItem>
            );
        });
    return (
        <HeaderContainer>
            <NavContainer>
                <Link href='/'>
                    <a>LOGO</a>
                </Link>
                <LinksContainer
                    className={`${showSidebar ? 'show-sidebar' : ''}`}
                >
                    <LinksList>{links}</LinksList>
                </LinksContainer>
                <ToggleMenu onClick={() => setShowSidebar(!showSidebar)}>
                    CLICK
                </ToggleMenu>
            </NavContainer>
        </HeaderContainer>
    );
};

export default Header;

const HeaderContainer = styled.div`
    background-color: red;
    height: 60px;
    width: 100vw;
`;

const NavContainer = styled.nav`
    padding: 1em;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    position: relative;
`;
const LinksContainer = styled.div`
    background-color: lightgoldenrodyellow;
    padding: 2em;
    position: absolute;
    top: 60px;
    right: 0;
    height: calc(100vh - 60px);
    width: 60%;
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;

    &.show-sidebar {
        transform: translateX(0);
    }

    @media screen and (${breakpoint.device.sm}) {
        background-color: blueviolet;
        position: relative;
        padding: 0;
        top: unset;
        right: unset;
        height: unset;
        display: grid;
        place-items: center;
        transform: translateX(0);
    }
`;

const LinksList = styled.ul`
    background-color: greenyellow;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.5em;
    width: 100%;

    @media screen and (${breakpoint.device.sm}) {
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: 1fr;
        grid-auto-columns: auto;
    }
`;

const ListItem = styled.li`
    width: 100%;

    a {
        background-color: blueviolet;
        display: block;
        padding: 0.5em 1em;
        text-align: center;
        width: 100%;
    }

    @media screen and (${breakpoint.device.sm}) {
        a {
            padding: 0;
        }
    }
`;

const ToggleMenu = styled.div`
    cursor: pointer;
    display: block;

    @media screen and (${breakpoint.device.sm}) {
        display: none;
    }
`;
