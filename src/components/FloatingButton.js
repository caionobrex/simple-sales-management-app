import React from 'react';
import { Flex } from "@chakra-ui/core";

export default function FloatingButton({ children, onClick, color }) {
  return (
    <Flex
      as="button"
      pos="fixed"
      bottom={["1rem", "3rem"]}
      right={["1rem", "3rem"]}
      borderRadius="full"
      bg={color ? color : 'teal.400'}
      w="60px"
      h="60px"
      justifyContent="center"
      alignItems="center"
      boxShadow="lg"
      outline="none"
      border="none"
      onClick={onClick}
    >
      {children}
    </Flex>
  );
};