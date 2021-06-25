import React, { useState, useEffect } from "react";
import { useHistory } from "react-router";
import { ItemList } from ".";
import {
  Box,
  Flex,
  Button,
  NumberInput,
  NumberInputField,
  Center,
  Spinner
} from "@chakra-ui/core";

const OrdersTableRow = ({ order, pickOrder, isSelected }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      as="tr"
      cursor="pointer"
      bg={isHovering || isSelected ? 'green.200' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => pickOrder(order)}
    >
      <Box as="td" p="2" textAlign="left">{order._id}</Box>
      <Box as="td" textAlign="center">{order.itemsCount}</Box>
      <Box as="td" textAlign="center">R$ {order.total.toFixed(2)}</Box>
      <Box as="td" textAlign="center">{getDate(order.createdAt)}</Box>
    </Box>
  );
};

const OrdersTable = ({ orders, selectedOrder, pickOrder }) => (
  <Box as="table">
    <Box as="thead">
      <Box as="tr">
        <Box as="th" p="2" textAlign="left">Pedido</Box>
        <Box as="th" textAlign="center">Items</Box>
        <Box as="th" textAlign="center">Total</Box>
        <Box as="th" textAlign="center">Data</Box>
      </Box>
    </Box>
    <Box as="tbody">
      {orders.map((order) => (
        <OrdersTableRow
          order={order}
          pickOrder={pickOrder}
          isSelected={order._id === selectedOrder}
        />
      ))}
    </Box>
  </Box>
);

export default function DebtMaker(props) {
  const [orders, setOrders] = useState([]);
  const [isFetching, setIsFecthing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [debt, setDebt] = useState({ items: [], value: 0, paid: 0 });
  const { client } = props.match.params;
  const history = useHistory();

  const pickOrder = (order) => {
    setSelectedOrder(order._id);
    setDebt({
      ...debt,
      items: [...order.items],
      value: order.total
    });
  };

  const changeQty = (item, qty) => {
    if (qty <= 0) qty = 1;
    const debtItems = debt.items.map((i) => {
      if (i.name === item) {
        i.qty = qty;
        i.subTotal = i.price * qty;
      }
      return i;
    });
    setDebt({
      ...debt,
      items: debtItems,
      value: calcTotal(debtItems)
    });
  };

  const deleteItem = (name) => {
    const filter = (item) => item.name !== name;
    const items = debt.items.filter(filter);
    setDebt({
      ...debt,
      items: items,
      value: calcTotal(items)
    });
    if (items.length === 0) setSelectedOrder('');
  };

  const applyDiscount = (discount) => {
    if (!discount || discount <= 0) {
      return setDebt({
        ...debt,
        value: calcTotal(debt.items),
        paid: 0
      });
    }
    setDebt({
      ...debt,
      value: debt.value - discount,
      paid: discount
    });
  };

  const calcTotal = (items) => {
    let total = 0;
    items.forEach((item) => total += item.subTotal);
    return total;
  };

  const onSubmitDebt = () => {
    if (debt.items.length === 0 || debt.value === 0) return;
    fetch(`/api/clients/${client}/debts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(debt)
    })
    .then(_res => {
      history.push(`/clients/${client}/debts`);
    });
  };

  useEffect(() => {
    setIsFecthing(true);
    fetch(`/api/clients/${client}/orders?nPerPage=30`)
    .then(res => res.json())
    .then((orders) => {
      setOrders(orders.orders);
      setIsFecthing(false);
    });
  }, [client]);

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
      bg="white"
      zIndex="1200"
    >
      <Box
        pos="fixed"
        w="35%"
        h="100%"
        d={['none', 'block']}
        overflowY="scroll"
      >
        {isFetching ? (
          <Center p={4}><Spinner /></Center>
        ) : (
          <OrdersTable
            orders={orders}
            selectedOrder={selectedOrder}
            pickOrder={pickOrder}
          />
        )}
      </Box>

      <Box
        as="main"
        ml={['0', '35%']}
        w={['100%', '75%']}
      >
        <Flex
          as="header"
          bg="red.300"
          color="white"
          justifyContent="space-between"
          alignItems="center"
          fontWeight="semibold"
          h="10vh"
          p="3"
        >
          <Box as="span">Debito Para {client}</Box>
          <Box as="span">
            Valor: R$ {debt.value.toFixed(2)}
          </Box>
        </Flex>

        <Box
          as="main"
          h="80vh"
          p="2"
          overflowY="auto"
        >
          <ItemList
            items={debt.items}
            changeQty={changeQty}
            deleteItem={deleteItem}
          />
        </Box>

        <Flex
          as="footer"
          justifyContent="space-between"
          alignItems="center"
          bg="red.300"
          h="10vh"
          p={3}
        >
          <NumberInput isDisabled={debt.value === 0} onChange={applyDiscount}>
            <NumberInputField placeholder="Pago" bg="white" />
          </NumberInput>
          <Button disabled={debt.value === 0} onClick={onSubmitDebt}>
            Criar Debito
          </Button>
        </Flex>
      </Box>

    </Flex>
  );
};

function getDate(dateValue) {
  const date = new Date(dateValue);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}