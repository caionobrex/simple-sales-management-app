import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Box, Center, Flex, Spinner } from '@chakra-ui/core';
import { ItemList } from '.';
import { CloseIcon } from '@chakra-ui/icons';

export default function DebtPage(props) {
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
  }, [props.match.params]);

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
        pos="relative"
      >
        <CloseIcon
          pos="absolute"
          cursor="pointer"
          top="3px"
          right="3px"
          color="white"
          onClick={() => history.goBack()}
        />

        {isFecthing ? <Center p={4}><Spinner /></Center> : (
          <>
            <Flex
              as="header"
              color="white"
              justifyContent="space-between"
              fontWeight="semibold"
              fontSize="1.2rem"
              p={5}
              bg={debt.state === 'Pago' ? 'green.300' : 'red.300'}
            >
              <Box as="span">Debito</Box>
              <Box as="span">Items: {debt.itemsCount}</Box>
              <Box as="span">R$ {debt.value.toFixed(2)}</Box>
            </Flex>

            <Box p={3} mt={3}>
              <ItemList items={debt.items} />
            </Box>
          </>
        )}
      </Box>
    </Flex>
  );
};