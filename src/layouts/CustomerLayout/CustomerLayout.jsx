
import { Outlet } from 'react-router-dom';

import Navbar from '../../components/customer/Navbar/Navbar';
import Footer from '../../components/customer/Footer/Footer';

import './CustomerLayout.css';

function CustomerLayout() {
  return (
    <div className="app customer-layout">
      <Navbar />

      <main className="customer-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default CustomerLayout;
