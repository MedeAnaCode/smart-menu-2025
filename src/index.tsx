import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';


const root = ReactDOM.createRoot(document.querySelector('#root')!); //Восклицательный знак тут,
// чтобы дать понять typescript, что root точно не null (не хочу забыть, новая для меня конструкция)

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
