import React from 'react';
import { DeleteButton } from '.';
import {
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/core';

const ItemsTableRow = ({ item, changeQty, deleteItem }) => (
  <Box as="tr">
    <Box as="td" textAlign="left">{item.name}</Box>
    <Box as="td" textAlign="left">R$ {item.price.toFixed(2)}</Box>
    <Box as="td" textAlign="center">
      <NumberInput
        min={1}
        value={item.qty}
        onChange={(value) => changeQty ? changeQty(item.name, parseInt(value)) : null}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </Box>
    <Box as="td" textAlign="center">R$ {item.subTotal.toFixed(2)}</Box>
    <Box as="td" textAlign="center">
      <DeleteButton
        header="Deletar Item"
        onDelete={() => deleteItem ? deleteItem(item.name) : null}
      />
    </Box>
  </Box>
);

export default function ItemsTable ({ items, changeQty, deleteItem }) {
  return (
    <Box as="table">
      <Box as="thead">
        <Box as="tr">
          <Box as="th" textAlign="left">Produto</Box>
          <Box as="th" textAlign="left">Preço</Box>
          <Box as="th" textAlign="center">Quantidade</Box>
          <Box as="th" textAlign="center">SubTotal</Box>
          <Box as="th"></Box>
        </Box>
      </Box>
      <Box as="tbody">
        {items.map((item) => (
          <ItemsTableRow
            item={item}
            changeQty={changeQty}
            deleteItem={deleteItem}
          />
        ))}
      </Box>
    </Box>
  );
};