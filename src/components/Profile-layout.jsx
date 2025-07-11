import React from 'react';
import Sidebar from './Sidebar.jsx';
import {Outlet} from 'react-router-dom';

function ProfileLayout () {

    return <main className="functional-page">
        <h1 className="visually-hidden">
            Рецепты "Smart menu".
        </h1>
        <Outlet/>
        <Sidebar/>
    </main>
}

export default ProfileLayout;
