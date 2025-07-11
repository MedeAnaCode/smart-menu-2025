import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App.jsx';


const root = ReactDOM.createRoot(document.querySelector('#root'));

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);

// import RecipeCard from './components/Recipes-card.jsx';
// import saladImage from './img/salad.png';
// import data from './api.js';
// root.render(
//     <React.StrictMode>
//         <RecipeCard
//             imageUrl={saladImage}
//             title="Гречка"
//             preparingText="Описание процесса приготовления гречки."
//         />
//     </React.StrictMode>
// );
