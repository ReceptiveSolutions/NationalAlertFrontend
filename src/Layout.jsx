// src/components/Layout.jsx
import React from 'react';
import Header from './components/Header/header';
import Footer from './components/Footer/footer';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* This is where nested routes will render */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
