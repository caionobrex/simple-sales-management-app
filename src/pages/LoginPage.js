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

export default function LoginPage(props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  
  const handleUserChangeEvent = (event) => setUser(event.target.value);
  
  const handlePassChangeEvent = (event) => setPass(event.target.value);
  
  const onSubmitHandle = (event) => {
    event.preventDefault();
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    })
    .then(res => res.json())
    .then(data => {
      if (!data.user) return alert('Credencias erradas.');

      localStorage.setItem('user', data.user);
      props.setUser(data.user);
    });
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