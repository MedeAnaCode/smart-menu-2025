import React from 'react';
import {Outlet, useMatch} from 'react-router-dom';

function ProfileLayout () {
    const isMenu = useMatch('/profile/menu');

    return <div className={`functional-page${isMenu ? ' functional-page--menu' : ''}`}>
        <section className="functional-page__content">
            <Outlet/>
        </section>
    </div>
}

export default ProfileLayout;
