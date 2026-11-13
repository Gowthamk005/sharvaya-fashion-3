import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function StoreLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}
