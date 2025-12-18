import React from 'react';
import './../style/main.scss';
import MainContainer from './Main-container';
import Layout from './Layout';
import ProfileLayout from './Profile-layout';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Recipes from "./Recipes";
import Menu from "./Menu";

function App()  {
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
