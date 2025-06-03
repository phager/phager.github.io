import React from 'react';
import { createRoot } from 'react-dom/client';
import CarryTradeMatrix from './components/CarryTradeMatrix';

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <CarryTradeMatrix />
  </React.StrictMode>
); 