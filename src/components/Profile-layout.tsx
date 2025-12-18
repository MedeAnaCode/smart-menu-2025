import React from 'react';
import Sidebar from './Sidebar';
import {Outlet} from 'react-router-dom';

function ProfileLayout () {

    return <div className="functional-page">
        <section className="functional-page__content">
            <Outlet/>
        </section>
            <Sidebar/>
    </div>
}

export default ProfileLayout;
