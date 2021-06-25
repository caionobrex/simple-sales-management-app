import React from 'react';
import { DeleteButton } from ".";
import { Box, Select, Flex, useToast, Grid } from "@chakra-ui/core";
import { Link } from 'react-router-dom';
import moment from 'moment';

const OrderCard = ({ order, onClick, onClickDelete, changeOrderState }) => {
  const isNew = isNewOrder(order.createdAt);

  const onChangeHandle = (event) => changeOrderState(event.currentTarget.value, order._id);

  return (
    <Box transition="all 0.6s" boxShadow="md">
      <Flex
        as="header"
        justifyContent="space-between"
        boxShadow="md"
        color="gray.700"
        fontWeight="semibold"
        cursor="pointer"
        p={4}
        bg={order.state === 'Entregue' ? 'green.300' : isNew ? 'yellow.300' : 'blue.300'}
        onClick={() => onClick(order)}
      >
        <Box as="span">Nº {order._id}</Box>
        <Box as="span">Items: {order.itemsCount}</Box>
        <Box as="span">R$ {order.total.toFixed(2)}</Box>
      </Flex>

      <Box as="main" p={5} pt={6} pb={6}>
        <Box as="p" mb={4}>
          <Link to={`/clients/${order.by.name}/orders`}>
            <Box as="span" color="gray.500">Por:</Box> {order.by.name}
          </Link>
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Entregua em:</Box> {order.by.addresses[0].street}
        </Box>
        <Box as="p" mb={4}>
          <Link to={`/orders/${order._id}/deliveredBy`}>
            <Box as="span" color="gray.500">Entregador:</Box> {order.deliveredBy}
          </Link>
        </Box>
        <Box as="p">
          <Box as="span" color="gray.500">Feito em:</Box> {getDate(order.createdAt)}
        </Box>
      </Box>

      <Flex
        as="footer"
        justifyContent="space-between"
        alignItems="center"
        borderTop="1px"
        borderColor="gray.200"
        p={4}
      >
        <Box>
          <Select onChange={onChangeHandle}>
            {['Registrado', 'Entregue'].map((state) => (
              <Box as="option" selected={state === order.state}>
                {state}
              </Box>
            ))}
          </Select>
        </Box>
        {order.state === 'Entregue' ? null : (
          <DeleteButton
            header={`Deletar Pedido ${order._id} ?`}
            onDelete={() => onClickDelete(order)}
          />
        )}
      </Flex>
    </Box>
  );
};

export default function OrderList(props) {
  const toast = useToast();

  const changeOrderState = (state, orderId) => {
    fetch(`/api/orders/${orderId}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state })
    })
    .then(_res => {
      const orderList = props.orders.map((order) => {
        if (order._id === orderId) order.state = state;
        return order;
      });
      props.setOrders(orderList);
    });
  };
  
  const onClickDelete = (order) => {
    fetch(`/api/clients/${order.by.name}/orders/${order._id}`, {
      method: 'DELETE'
    }).then(_res => {
      props.setOrders(props.orders.filter((o) => o._id !== order._id));
      toast({
        title: `Pedido ${order._id} deletado com sucesso.`,
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    });
  };

  return (
    <Grid
      templateColumns={["100%", "repeat(3, 1fr)"]}
      columnGap={3}
      rowGap={5}
    >
      {props.orders.map((order) => (
        <OrderCard
          order={order}
          onClick={props.onClick}
          changeOrderState={changeOrderState}
          onClickDelete={onClickDelete}
        />
      ))}
    </Grid>
  );
};

function isNewOrder(orderDate) {
  const now = moment();
  orderDate = moment(orderDate);
  return orderDate.month() === now.month() && orderDate.date() === now.date() && orderDate.year() === now.year();
}

function getDate(dateValue) {
  const date = new Date(dateValue);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ás ${date.toLocaleTimeString()}`;
}