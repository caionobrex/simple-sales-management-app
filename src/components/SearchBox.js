import React from 'react';
import { Box, Flex } from '@chakra-ui/core';
import { MdSearch } from 'react-icons/md';

export default function SearchBox({ onSearch, placeHolder }) {
  const onInputHandle = (event) => onSearch(event.currentTarget.value);
  
  return (
    <Flex
      bg="gray.100"
      alignItems="center"
      borderRadius="full"
      p={2}
      pl={3}
      pr={3}
    >
      <Box
        as="input"
        type="search"
        outline="none"
        bg="inherit"
        placeHolder={placeHolder ? placeHolder : 'Pesquisar'}
        color="gray.600"
        pl={2}
        pr={2}
        ml={1}
        width="100%"
        onInput={onInputHandle}
      />
      <Box color="gray.600" as="i">
        <MdSearch fontSize="1.4rem" cursor="pointer" />
      </Box>
    </Flex>
  );
};