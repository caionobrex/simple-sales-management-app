import React, { useEffect, useState } from 'react';
import { Route, useHistory } from 'react-router-dom';
import { FloatingButton, OpenMobileNavBtn, OrderList, Pagination, SearchBox } from '../components';
import { Box, Center, Checkbox, Flex, Spinner } from '@chakra-ui/core';
import { AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import queryString from 'query-string';

const ClientList = () => {
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
      <Box
        w={['100%', '500px']}
        h={['100%', '400px']}
        bg="white"
      >
        {isFetching ? <Center><Spinner /></Center> : (
          <>
            <Box bg="blue.300" p={4}>
              <Box
                as="span"
                color="white"
                fontWeight="semibold"
                fontSize="1.2rem"
              >
                Novo Pedido
              </Box>
            </Box>

            <Box
              pl={4}
              pr={4}
              pb={6}
              mt={3}
              overflowY="auto"
              maxH="100%"
              bg="white"
            >
              <SearchBox onSearch={onSearchHandle} />
              <Box mt={3}>
                {clients.map((client) => (
                  <Flex
                    p={3}
                    cursor="pointer"
                    onClick={() => history.push(`/clients/${client.name}/orders/add`)}
                  >
                    <Box flex="0 40%">{client.name}</Box>
                    <Box flex="1">{client.addresses[0].street}</Box>
                  </Flex>
                ))}
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default function OrdersPage(props) {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [numberPerPage, setNumberPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(
    !queryString.parse(props.location.search).page ? 1 : parseInt(queryString.parse(props.location.search).page)
  );
  const [onlyDailyOrders, setOnlyDailyOrders] = useState(
    localStorage.getItem('onlyDailyOrders') ? true : false
  );
  const [filters, setFilters] = useState({
    initialDate: '',
    finalDate: ''
  });
  const history = useHistory();
  
  const onClickHandle = (page) => {
    history.push(`/orders?page=${page}`);
    setCurrentPage(page);
  };
  
  const onChangeHandle = () => {
    setOnlyDailyOrders(!onlyDailyOrders);
    if (localStorage.getItem('onlyDailyOrders'))
      localStorage.removeItem('onlyDailyOrders');
    else
      localStorage.setItem('onlyDailyOrders', true);
  };
  
  const getTotal = (orders) => {
    let total = 0;
    orders.forEach((order) => total += order.total);
    return total.toFixed(2);
  };

  useEffect(() => {
    setIsFetching(true);
    const { initialDate, finalDate } = filters;
    const url = onlyDailyOrders ? '/api/orders/daily' : '/api/orders';
    const fetchOrders = () => {      
      axios.get(url, {
        params: {
          page: currentPage,
          initialDate,
          finalDate
        }
      })
      .then(({ data }) => {
        setOrders(data.orders);
        setNumberPerPage(data.nPerPage);
        setTotalCount(data.totalCount);
        setIsFetching(false);
      });
    };

    fetchOrders(); // Fetch for the first time
    const interval = setInterval(fetchOrders, 3000); // Refetch each 3 seconds
    return () => window.clearInterval(interval);
  }, [onlyDailyOrders, currentPage, filters]);

  return (
    <Box>
      <Flex
        bg="blue.400"
        justifyContent="space-between"
        alignItems="center"
        color="white"
        fontWeight="semibold"
        p={4}
      >
        <Box as="span" fontSize={["1.4rem", "2rem"]}>
          Pedidos / {totalCount}
        </Box>

        <Box as="span" d={["none", "inline"]}>
          {onlyDailyOrders ? `Total: R$ ${getTotal(orders)}` : null}
        </Box>

        <OpenMobileNavBtn />
      </Flex>

      <Box p={5} pb="4rem">
        <Flex pb={4} flexDirection={['column', 'row']}>
          <Checkbox
            mr={3}
            isChecked={onlyDailyOrders}
            onChange={onChangeHandle}
          >
            Diarios
          </Checkbox>

          {onlyDailyOrders ? null : (
            <>
              <Box
                ml={[0, 2]}
                mt={[3, 0]}
                border="1px"
                borderColor="gray.200"
                p={2}
              >
                <Box as="span" fontWeight="semibold">Data Inicial:</Box>
                <Box
                  as="input"
                  type="date"
                  ml={2}
                  onChange={(event) => setFilters({
                    initialDate: event.currentTarget.value,
                    finalDate: filters.finalDate
                  })}
                />
              </Box>

              <Box
                ml={[0, 2]}
                mt={[3, 0]}
                border="1px" 
                borderColor="gray.200" 
                p={2}
              >
                <Box as="span" fontWeight="semibold">Data Final:</Box>
                <Box
                  as="input"
                  type="date"
                  ml={2}
                  onChange={(event) => setFilters({
                    initialDate: filters.initialDate,
                    finalDate: event.currentTarget.value
                  })}
                />
              </Box>
            </>
          )}

          <Box as="span" mt={2} d={["inline", "none"]}>
            {onlyDailyOrders ? `Total: R$ ${getTotal(orders)}` : null}
          </Box>
        </Flex>

        {isFetching ? (
          <Center><Spinner /></Center>
        ) : orders.length === 0 ? (
          <Center>Vazio</Center>
        ) : (
          <>
            <OrderList
              orders={orders}
              setOrders={setOrders}
              onClick={(order) => history.push(`/orders/${order._id}/items`)}
            />
            {onlyDailyOrders ? null : (
              <Box mt={4}>
                <Pagination
                  currentPage={currentPage}
                  nOfPages={Math.ceil(totalCount / numberPerPage)}
                  onClick={onClickHandle}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <Route path="/orders/add" component={ClientList} />

      <FloatingButton onClick={() => history.push('/orders/add')}>
        <AddIcon color="white" />
      </FloatingButton>
    </Box>
  );
};