import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { ItemList } from '.';
import { CloseIcon } from '@chakra-ui/icons';
import { Box, Flex, Center, Spinner } from '@chakra-ui/core';

export default function Order(props) {
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
        w={["100%", "650px"]}
        h={["100%", "90%"]}
        bg="white"
      >
        <CloseIcon
          pos="absolute"
          cursor="pointer"
          top="3px"
          right="3px"
          color="white"
          onClick={() => history.goBack()}
        />

        {isFetching ? <Center><Spinner /></Center> : (
          <>
            <Flex
              p={3}
              pt={5}
              pb={5}
              color="white"
              justifyContent="space-between"
              alignItems="center"
              fontWeight="semibold"
              bg={order.state === 'Entregue' ? 'green.300' : 'blue.300'}
            >
              <Box as="span" fontSize="1.5rem">{order._id}</Box>
              <Box as="span">Items: {order.itemsCount}</Box>
              <Box as="span">Total: R$ {order.total.toFixed(2)}</Box>
            </Flex>

            <Box p={3} pb="8rem" h="90%" overflowY="auto">
              <ItemList items={order.items} />
            </Box>
          </>
        )}
      </Box>
    </Flex>
  );
};