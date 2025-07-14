import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import {Outlet} from 'react-router-dom';

function Layout () {

    return <>
        <Header/>
        <main>
            <Outlet/>
        </main>
        <Footer/>
    </>
}

export default Layout;
