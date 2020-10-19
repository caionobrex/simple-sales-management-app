import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { OrdersTable, Pagination } from '../components';
import { Box, Center, Checkbox, Flex, Input, Spinner } from '@chakra-ui/core';
import { AddIcon } from '@chakra-ui/icons';
import queryString from 'query-string';

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
    const url = onlyDailyOrders ? `/api/orders/daily?page=${currentPage}` : `/api/orders?page=${currentPage}`;
    fetch(url)
    .then(res => res.json())
    .then(data => {
      setOrders(data.orders);
      setNumberPerPage(data.nPerPage);
      setTotalCount(data.totalCount);
      setIsFetching(false);
    });
  }, [onlyDailyOrders, currentPage]);

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
        <Box as="span" fontSize="2rem">Pedidos / {totalCount}</Box>
        <Box as="span">
          {onlyDailyOrders ? `Total: R$ ${getTotal(orders)}` : null}
        </Box>
        <Link to="/orders/add"><AddIcon fontSize="1.5rem" /></Link>
      </Flex>

      <Box p={4}>
        <Flex
          pb={4}
          borderBottom="1px"
          borderColor="gray.200"
          flexDirection={['column', 'row']}
        >
          <Checkbox
            mr={3}
            isChecked={onlyDailyOrders}
            onChange={onChangeHandle}
          >
            Diarios
          </Checkbox>
          <Flex
            d={['none', 'flex']}
            flexDirection={['column', 'row']}
            mt={[3, 0]}
          >
            <Input type="date" />
            <Input type="date" mt={[3, 0]} ml={[0, 3]} />
          </Flex>
        </Flex>

        {isFetching ? (
          <Center><Spinner /></Center>
        ) : orders.length === 0 ? (
          <Center>Vazio</Center>
        ) : (
          <OrdersTable orders={orders} setOrders={setOrders} />
        )}

        {onlyDailyOrders ? null : (
          <Box mt={2}>
            <Pagination
              currentPage={currentPage}
              nOfPages={Math.ceil(totalCount / numberPerPage)}
              onClick={onClickHandle}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};