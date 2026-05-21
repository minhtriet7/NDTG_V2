import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <div className="font-sans antialiased">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
}