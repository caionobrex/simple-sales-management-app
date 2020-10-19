import React, { useState } from 'react';
import {
  Center,
  Box,
  FormControl,
  FormLabel,
  RequiredIndicator,
  Input,
  Heading,
  Button
} from '@chakra-ui/core';

const FormInput = (props) => (
  <FormControl id={props.id} isRequired={props.isRequired} {...props}>
    <FormLabel>
      {props.label} <RequiredIndicator />
    </FormLabel>
    <Input 
      type={props.type}
      value={props.value}
      onChange={props.onChange} />
  </FormControl>
);

export default function LoginForm(props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  
  const handleUserChangeEvent = (event) => setUser(event.target.value);
  
  const handlePassChangeEvent = (event) => setPass(event.target.value);
  
  const onSubmitHandle = (event) => {
    event.preventDefault();
    if (user === 'caio' && pass === 'nobre') {
      const user = { name: 'caio', pass: 'nobre' };
      localStorage.setItem('user', user);
      props.setUser(user);
    }
  };
  
  return (
    <Center minH="100vh" p={6}>
      <Box as="form" w={['100%', '40%']} onSubmit={onSubmitHandle}>
        <Heading mb={4}>Login</Heading>
        
        <FormInput
          id="user"
          isRequired={true}
          label="Usuário"
          type="text"
          value={user}
          onChange={handleUserChangeEvent} />
        
        <FormInput
          id="pass"
          isRequired={true}
          label="Senha"
          type="password"
          value={pass}
          mt={4}
          onChange={handlePassChangeEvent} />
          
        <Button
          type="submit"
          colorScheme="teal"
          mt={3}
        >
          Logar
        </Button>
      </Box>
    </Center>
  );
};