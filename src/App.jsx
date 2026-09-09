import React from 'react';
import Navbar from './components/Navbar';
import IdCardPage from './modules/idCard/IdCardPage';

function App() {
    return (
        <div className="app-shell">
            <Navbar />
            <IdCardPage />
        </div>
    );
}

export default App;
