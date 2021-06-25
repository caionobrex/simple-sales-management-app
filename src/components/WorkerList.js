import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Center, Flex, List, ListItem, Spinner } from '@chakra-ui/core';

export default function WorkerList(props) {
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
  });

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
      <Box
        w={['100%', '400px']}
        h={['100%', '400px']}
        bg="white"
      >
        <Box
          bg="blue.300"
          color="white"
          fontSize="1.5rem"
          fontWeight="semibold"
          p={4}
        >
          <Box as="span">Escolher entregador</Box>
        </Box>
        {isFetching ? (
          <Center><Spinner /></Center>
        ) : (
          <Box p={4}>
            <List spacing={4}>
              {workers.map((worker) => (
                <ListItem
                  cursor="pointer"
                  p={2}
                  bg={order.deliveredBy === worker.name ? 'green.200' : 'gray.50'}
                  onClick={() => onClickHandle(order._id, worker.name)}
                >
                  {worker.name}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    </Flex>
  );
};