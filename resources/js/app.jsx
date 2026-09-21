import React from 'react';
import { createRoot } from 'react-dom/client';

export default function App() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <h1 className="text-4xl font-bold mb-4">Hello React from Laravel!</h1>
            <p className="text-lg text-gray-500">Powered by Bun & Vite</p>
        </div>
    );
}

const rootElement = document.getElementById('app');
if (rootElement) {
    createRoot(rootElement).render(<App />);
}
