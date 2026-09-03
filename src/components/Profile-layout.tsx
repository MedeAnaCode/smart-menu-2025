import React from 'react';
import {Outlet} from 'react-router-dom';

function ProfileLayout () {

    return <div className="functional-page">
        <section className="functional-page__content">
            <Outlet/>
        </section>
    </div>
}

export default ProfileLayout;
