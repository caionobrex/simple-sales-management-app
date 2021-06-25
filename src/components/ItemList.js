import React from 'react';
import { DeleteButton } from '.';
import {
  Box,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  Grid
} from '@chakra-ui/core';

const ItemCard = ({ item, changeQty, deleteItem }) => (
  <Box boxShadow="md">
    <Flex
      as="header"
      color="white"
      fontWeight="semibold"
      borderBottom="1px"
      justifyContent="space-between"
      bg="blue.300"
      p={4}
    >
      <Box as="span">{item.name}</Box>
    </Flex>

    <Box as="main" p={5}>
      <Box as="p" mb={4}>
        <Box as="span" color="gray.500">Preço: </Box> R$ {item.price.toFixed(2)}
      </Box>
      <Box as="p" mb={4}>
        <Box as="span" color="gray.500">Quantidade: </Box> {item.qty}
      </Box>
      <Box as="p">
        <Box as="span" color="gray.500">SubTotal: </Box> R$ {item.subTotal.toFixed(2)}
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
      <DeleteButton
        header="Deletar Item"
        onDelete={() => deleteItem ? deleteItem(item.name) : null}
      />
    </Flex>
  </Box>
);

export default function ItemList ({ items, changeQty, deleteItem }) {
  return (
    <Grid
      templateColumns={['100%', 'repeat(2, 1fr)']}
      columnGap={2}
      rowGap={4}
    >
      {items.map((item) => (
        <ItemCard
          item={item}
          changeQty={changeQty}
          deleteItem={deleteItem}
        />
      ))}
    </Grid>
  );
};