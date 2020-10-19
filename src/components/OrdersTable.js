import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { DeleteButton } from ".";
import { Box, Select, useToast } from "@chakra-ui/core";

const OrdersTableRow = ({ order, onClickDelete, changeOrderState }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      as="tr"
      bg={order.state === 'Entregue' ? 'green.200' : isHovering ? 'gray.100' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Box as="td" textAlign="left" p={1}>
        <Link to={`/orders/${order._id}/items`}>{order._id}</Link>
      </Box>
      <Box as="td" textAlign="left">
        <Link to={`/clients/${order.by.name}/orders`}>{order.by.name}</Link>
      </Box>
      <Box as="td" textAlign="center">
        <Link to={`/orders/${order._id}/deliveredBy`}>{order.deliveredBy}</Link>
      </Box>
      <Box as="td" textAlign="center">{order.by.addresses[0].street}</Box>
      <Box as="td" textAlign="center">{order.itemsCount}</Box>
      <Box as="td" textAlign="center">R$ {order.discount.toFixed(2)}</Box>
      <Box as="td" textAlign="center">R$ {order.total.toFixed(2)}</Box>
      <Box as="td" textAlign="center">
        <Select onChange={(event) => changeOrderState(event.currentTarget.value, order._id)}>
          {['Registrado', 'Entregue'].map((state) => (
            <Box as="option" selected={state === order.state}>{state}</Box>
          ))}
        </Select>
      </Box>
      <Box as="td" textAlign="center">{getDate(order.createdAt)}</Box>
      <Box as="td" textAlign="center">
        {order.state === 'Entregue' ? null : (
          <DeleteButton
            header="Deletar Pedido"
            onDelete={() => onClickDelete(order)}
          />
        )}
      </Box>
    </Box>
  );
};

export default function OrdersTable(props) {
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
        title: 'Pedido deletado com sucesso.',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    });
  };

  return (
    <Box as="table">
      <Box as="thead">
        <Box as="tr">
          <Box as="th" textAlign="left" p={1}>Nº</Box>
          <Box as="th" textAlign="left">Por</Box>
          <Box as="th" textAlign="center">Entregador</Box>
          <Box as="th" textAlign="center">Endereço</Box>
          <Box as="th" textAlign="center">Items</Box>
          <Box as="th" textAlign="center">Descontado</Box>
          <Box as="th" textAlign="center">Total</Box>
          <Box as="th" textAlign="center">Estado</Box>
          <Box as="th" textAlign="center">Data</Box>
          <Box as="th" textAlign="center">Ações</Box>
        </Box>
      </Box>
      <Box as="tbody">
        {props.orders.map((order) => (
          <OrdersTableRow
            order={order}
            onClickDelete={onClickDelete}
            changeOrderState={changeOrderState}
          />
        ))}
      </Box>
    </Box>
  );
};

function getDate(dateValue) {
  const date = new Date(dateValue);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ás ${date.toLocaleTimeString()}`;
}