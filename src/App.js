import React, { useState } from 'react';
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import { OrderMaker, SideNav, DebtMaker, Debt, Order, WorkerList } from './components';
import { Box } from '@chakra-ui/core';
import {
  LoginPage,
  ClientsPage,
  ClientPage,
  OrdersPage,
  ProductsPage,
  ProductPage,
  WorkersPage
} from './pages';
import './App.css';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('user'));
  
  return (
    <Router>
      {user === null ? <LoginPage setUser={setUser} /> : (
        <>
          <SideNav setUser={setUser} />
          <Box w={["100%", "80%"]} ml={["0", "20%"]} minH="100vh">
            <Route exact path="/" component={() => <Redirect to="/orders" />} />
            <Route path="/orders" component={OrdersPage} />
            <Route path="/orders/:orderId/items" component={Order} />
            <Route path="/orders/:orderId/deliveredBy" component={WorkerList} />

            <Route exact path="/clients" component={ClientsPage} />
            <Route path="/clients/:client/:tab" component={ClientPage} />
            <Route path="/clients/:client/orders/add" component={OrderMaker} />
            <Route path="/clients/:client/orders/:orderId/items" component={Order} />
            <Route path="/clients/:client/debts/add" component={DebtMaker} />
            <Route path="/clients/:client/debts/:debtId/items" component={Debt} />

            <Route exact path="/workers" component={WorkersPage} />

            <Route exact path="/products" component={ProductsPage} />
            <Route path="/products/:id" component={ProductPage} />
          </Box>
        </>
      )}
    </Router>
  );
};