import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Link, Redirect, Route, useHistory } from 'react-router-dom';
import { LoginForm, OrderMaker, SearchBox, SideNav, DebtMaker, ItemsTable } from './components';
import { Box, Center, Flex, Spinner } from '@chakra-ui/core';
import {
  ClientsPage,
  ClientPage,
  OrdersPage,
  ProductsPage,
  ProductPage,
  WorkersPage
} from './pages';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('user'));
  
  return (
    <Router>
      {user === null ? <LoginForm setUser={setUser} /> : (
        <>
          <SideNav setUser={setUser} />
          <Box w={["100%", "80%"]} ml={["0", "20%"]} minH="100vh">
            <Route exact path="/" component={() => <Redirect to="/orders" />} />
            <Route exact path="/orders" component={OrdersPage} />
            <Route exact path="/orders/add" component={ClientList} />
            <Route exact path="/orders/:orderId/items" component={Order} />
            <Route exact path="/orders/:orderId/deliveredBy" component={WorkerList} />

            <Route exact path="/clients" component={ClientsPage} />
            <Route exact path="/clients/:client/:tab" component={ClientPage} />
            <Route exact path="/clients/:client/orders/add" component={OrderMaker} />
            <Route exact path="/clients/:client/debts/add" component={DebtMaker} />
            <Route exact path="/clients/:client/debts/:debtId/items" component={DebtPage} />

            <Route exact path="/workers" component={WorkersPage} />

            <Route exact path="/products" component={ProductsPage} />
            <Route path="/products/:id" component={ProductPage} />
          </Box>
        </>
      )}
    </Router>
  );
};

function DebtPage(props) {
  const [debt, setDebt] = useState({});
  const [isFecthing, setIsFetching] = useState(true);
  const history = useHistory();
  
  useEffect(() => {
    const { client, debtId } = props.match.params;
    fetch(`/api/clients/${client}/debts/${debtId}`)
    .then(res => res.json())
    .then(debt => {
      setDebt(debt);
      setIsFetching(false);
    });
  });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    function onKeyDownHandler(event) {
      if (event.keyCode === 27) history.goBack();
    }

    document.addEventListener('keydown', onKeyDownHandler);
    return () => document.removeEventListener('keydown', onKeyDownHandler);
  });

  return (
    <Flex
      pos="fixed"
      w="100%"
      h="100%"
      top="0"
      left="0"
      justifyContent="center"
      alignItems="center"
      bg="rgba(0,0,0,0.5)"
    >
      <Box
        w={['100%', '650px']}
        h={['100%', '90%']}
        bg="white"
        overflowY="auto"
      >
        {isFecthing ? <Center p={4}><Spinner /></Center> : (
          <Box p={3}>
            <ItemsTable items={debt.items} />
          </Box>
        )}
      </Box>
    </Flex>
  );
}

function Order(props) {
  const [order, setOrder] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const { orderId } = props.match.params;
    setIsFetching(true);
    fetch(`/api/orders/${orderId}`)
    .then(res => res.json())
    .then(order => {
      setOrder(order);
      setIsFetching(false);
    });
  }, [props.match.params]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  });

  useEffect(() => {
    function onKeyDownHandler(event) {
      if (event.keyCode === 27) history.goBack();
    }

    document.addEventListener('keydown', onKeyDownHandler);
    return () => document.removeEventListener('keydown', onKeyDownHandler);
  });

  return (
    <Flex
      pos="fixed"
      w="100%"
      h="100%"
      top="0"
      left="0"
      justifyContent="center"
      alignItems="center"
      bg="rgba(0,0,0,0.2)"
    >
      <Box
        pos="relative"
        w={['100%', '650px']}
        h={['100%', '90%']}
        bg="white"
        overflowY="auto"
      >
        <Flex
          p={3}
          pt={5}
          pb={5}
          bg="blue.300"
          color="white"
          justifyContent="space-between"
          alignItems="center"
          fontWeight="semibold"
        >
          {isFetching ? null : (
            <>
              <Box as="span" fontSize="1.5rem">{order._id}</Box>
              <Box as="span">Items: {order.itemsCount}</Box>
              <Box as="span">Total: R$ {order.total.toFixed(2)}</Box>
            </>
          )}
        </Flex>

        {isFetching ? <Center><Spinner /></Center> : (
          <Box p={3}>
            <ItemsTable items={order.items} />
          </Box>
        )}
      </Box>
    </Flex>
  );
}

function WorkerList(props) {
  const [order, setOrder] = useState({});
  const [workers, setWorkers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const onClickHandle = (orderId, worker) => {
    fetch(`/api/orders/${orderId}/deliveredBy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deliveredBy: worker })
    })
    .then(_res => {
      history.goBack();
    });
  };

  useEffect(() => {
    const { orderId } = props.match.params;
    setIsFetching(true);
    Promise.all([
      fetch(`/api/orders/${orderId}`).then(res => res.json()),
      fetch('/api/workers').then(res => res.json())
    ])
    .then(([order, workers]) => {
      setOrder(order);
      setWorkers(workers);
      setIsFetching(false);
    });
  }, [props.match.params]);

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => document.body.style.overflowY = 'auto';
  }, []);

  useEffect(() => {
    function onKeyUpHandle(event) {
      if (event.keyCode === 27) {
        history.goBack();
        document.body.style.overflowY = 'auto';
      }
    }
    document.addEventListener('keyup', onKeyUpHandle);
    return () => document.removeEventListener('keyup', onKeyUpHandle);
  });

  return (
    <Flex
      pos="fixed"
      top="0"
      left="0"
      w="100%"
      h="100%"
      bg="rgba(0,0,0,0.6)"
      justifyContent="center"
      alignItems="center"
    >
      <Box bg="white" w={['100%', '400px']} h={['100%', '400px']}>
        <Box
          bg="blue.300"
          color="white"
          fontSize="1.5rem"
          fontWeight="semibold"
          p={2}
          pt={4}
          pb={4}
        >
          <Box as="span">Escolher entregador</Box>
        </Box>
        {isFetching ? (
          <Center><Spinner /></Center>
        ) : (
          <Box p={2}>
            <Box as="table">
              <Box as="thead">
                <Box as="tr">
                  <Box as="th" textAlign="left">Nome</Box>
                </Box>
              </Box>
              <Box as="tbody">
                {workers.map((worker) => (
                  <Box
                    as="tr"
                    cursor="pointer"
                    bg={order.deliveredBy === worker.name ? 'green.200' : ''}
                    onClick={() => onClickHandle(order._id, worker.name)}
                  >
                    <Box as="td">{worker.name}</Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

function ClientList() {
  const [clients, setClients] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const onSearchHandle = (searchValue) => {
    if (!searchValue) {
      fetch('/api/clients?nPerPage=30')
      .then(res => res.json())
      .then(clients => {
        setClients(clients.clients);
      });
    } else {
      fetch(`/api/clients/search?searchBy=1&query=${searchValue}`)
      .then(res => res.json())
      .then(setClients);
    }
  };

  useEffect(() => {
    setIsFetching(true);
    fetch(`/api/clients?nPerPage=30`)
    .then(res => res.json())
    .then(clients => {
      setClients(clients.clients);
      setIsFetching(false);
    });
  }, []);

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => document.body.style.overflowY = 'auto';
  }, []);

  useEffect(() => {
    function onKeyUpHandle(event) {
      if (event.keyCode === 27) {
        history.push('/orders');
        document.body.style.overflowY = 'auto';
      }
    }
    document.addEventListener('keyup', onKeyUpHandle);
    return () => document.removeEventListener('keyup', onKeyUpHandle);
  });

  return (
    <Flex
      pos="fixed"
      w="100%"
      h="100%"
      top="0"
      left="0"
      bg="rgba(0,0,0,0.5)"
      zIndex="1500"
      justifyContent="center"
      alignItems="center"
    >
      <Box bg="white" w={['100%', '400px']} h={['100%', '400px']} >
        {isFetching ? <Center><Spinner /></Center> : (
          <>
            <Box>
              <SearchBox onSearch={onSearchHandle} />
            </Box>

            <Box
              pl={3}
              pr={3}
              mt={2}
              overflowY="auto"
              maxH="100%"
              bg="white"
            >
              <Box as="table">
                <Box as="thead">
                  <Box as="tr">
                    <Box as="th" textAlign="left">Nome</Box>
                    <Box as="th" textAlign="left">Endereço</Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {clients.map((client) => (
                    <Box as="tr">
                      <Box as="td" textAlign="left">
                        <Link to={`/clients/${client.name}/orders/add`}>
                          {client.name}
                        </Link>
                      </Box>
                      <Box as="td" textAlign="left">{client.addresses[0].street}</Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Flex>
  );
}