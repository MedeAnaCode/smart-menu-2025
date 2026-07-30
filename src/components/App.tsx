import React from 'react';
import './../style/main.scss';
import MainContainer from './Main-container';
import Layout from './Layout';
import ProfileLayout from './Profile-layout';
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Recipes from "./Recipes";
import Menu from "./Menu";
import {AuthProvider} from "../auth/AuthContext";

function App()  {
    return (
        <AuthProvider>
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
        </AuthProvider>
    );
}

export default App;

