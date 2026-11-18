
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import CustomerLayout from '../layouts/CustomerLayout/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';

// Route Protection
import AdminRoute from './AdminRoute';

// Customer Pages
import Home from '../pages/customer/Home/Home';
import Products from '../pages/customer/Products/Products';
import ProductDetails from '../pages/customer/ProductDetails/ProductDetails';
import Cart from '../pages/customer/Cart/Cart';
import Checkout from '../pages/customer/Checkout/Checkout';
import OrderSuccess from '../pages/customer/OrderSuccess/OrderSuccess';
import Profile from '../pages/customer/Profile/Profile';

// Authentication Pages
import Login from '../pages/auth/Login/Login';
import Register from '../pages/auth/Register/Register';

// Admin Pages
import Dashboard from '../pages/admin/Dashboard/Dashboard';
import ProductsManagement from '../pages/admin/ProductsManagement/ProductsManagement';
import UsersManagement from '../pages/admin/UsersManagement/UsersManagement';
import CartsManagement from '../pages/admin/CartsManagement/CartsManagement';

function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
           <Route path="products" element={<ProductsManagement />} />
           <Route path="users" element={<UsersManagement />} />
           <Route path="carts" element={<CartsManagement />} />
        </Route>
      </Route>

      {/* Customer Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
