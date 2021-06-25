import React from 'react';
import { NavLink } from 'react-router-dom';
import { Box, Flex, List, ListItem, Button } from '@chakra-ui/core';
import { useSideNav } from '../contexts/SideNavContext';
import { CloseIcon } from '@chakra-ui/icons';

export default function SideNav({ setUser }) {
  const { isOpen, setIsOpen } = useSideNav();
  const style = { display: 'block', padding: '1rem 1.5rem' };
  const activeStyle = { backgroundColor: '#f5f5f5', color: '#424242' };

  const onClickHandle = () => {
    document.body.style.overflowY = "auto";
    setIsOpen(false);
  };
  
  return (
    <Box
      display={[isOpen ? "block" : "none", "block"]}
      w={["85%", "20%"]}
      h="100%"
      bg="gray.800"
      position="fixed"
      top="0"
      left="0"
      zIndex={900}
    >
      <CloseIcon
        color="white"
        fontWeight="semibold"
        display={["inline-block", "none"]}
        position="absolute"
        top={2}
        right={2}
        onClick={onClickHandle}
      />
      
      <Flex
        mt={["2.5rem", 0]}
        direction="column"
        justify="space-between"
        h="100%"
      >
        <List
          fontWeight="500"
          fontSize="lg"
          color="white"
        >
          <ListItem  onClick={onClickHandle}>
            <NavLink
              exact to="/orders"
              style={style}
              activeStyle={activeStyle}
            >
              Pedidos
            </NavLink>
          </ListItem>
          <ListItem onClick={onClickHandle}>
            <NavLink
              exact to="/clients" 
              style={style}
              activeStyle={activeStyle}
            >
              Clientes
            </NavLink>
          </ListItem>
          <ListItem onClick={onClickHandle}>
            <NavLink
              exact to="/workers"
              style={style} 
              activeStyle={activeStyle}
            >
              Funcionários
            </NavLink>
          </ListItem>
          <ListItem onClick={onClickHandle}>
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
          onClick={() => {
            fetch('/api/auth/logout')
            .then(_res => {
              localStorage.removeItem('user');
              setUser(null);
            })
          }}
        >
          Sair
        </Button>
      </Flex>
    </Box>
  );
};