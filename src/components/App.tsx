import React from 'react';
import './../style/main.scss';
import MainContainer from './Main-container.jsx';
import Layout from './Layout.jsx';
import ProfileLayout from './Profile-layout.jsx';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Recipes from "./Recipes.jsx";
import Menu from "./Menu.jsx";

function App () {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<MainContainer/>}/>
                    <Route path="profile" element={<ProfileLayout/>}>
                        <Route path="recipes" element={<Recipes/>}/>
                        <Route path="menu" element={<Menu/>}/>
                    </Route>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
