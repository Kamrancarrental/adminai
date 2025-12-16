
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Inbox } from './pages/Inbox';
import { NotificationProvider } from './context/NotificationContext';

export type PageName = 'dashboard' | 'orders' | 'customers' | 'products' | 'inbox';

function App() {
  const [currentPage, setCurrentPage] = useState<PageName>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <Orders />;
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'inbox':
        return <Inbox />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <NotificationProvider>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
    </NotificationProvider>
  );
}

export default App;
