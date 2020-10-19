import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Flex, List, ListItem, Button } from '@chakra-ui/core';

export default function SideNav({ setUser }) {
  const style = { display: 'block', padding: '1rem 1.5rem' };
  const activeStyle = { backgroundColor: '#f5f5f5', color: '#424242' };

  const onClickHandle = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  return (
    <Box
      display={["none", "block"]}
      w={["100%", "20%"]}
      h="100%"
      bg="gray.800"
      position="fixed"
      transition="all 0.2s ease-in-out"
      zIndex={900}
    >
      <Button
        as="i" 
        display={["inline-block", "none"]}
        position="absolute"
        top={1}
        right={1}
      >
        X
      </Button>
      
      <Flex
        direction="column"
        justify="space-between"
        h="100%"
      >
        <List
          fontWeight="500"
          fontSize="lg"
          color="white"
        >
          <ListItem>
            <NavLink
              exact to="/orders"
              style={style}
              activeStyle={activeStyle}
            >
              Pedidos
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink
              exact to="/clients" 
              style={style}
              activeStyle={activeStyle}
            >
              Clientes
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink
              exact to="/workers"
              style={style} 
              activeStyle={activeStyle}
            >
              Funcionários
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink
              exact to="/products"
              style={style} 
              activeStyle={activeStyle}
            >
              Produtos
            </NavLink>
          </ListItem>
        </List>
        
        <Button
          colorScheme="red"
          borderRadius="0"
          w="100%" 
          onClick={onClickHandle}
        >
          Sair
        </Button>
      </Flex>
    </Box>
  );
};