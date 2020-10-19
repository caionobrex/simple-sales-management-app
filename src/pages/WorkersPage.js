import React, { createRef, useEffect, useState } from 'react';
import { DeleteButton } from '../components';
import {
  Box,
  Button,
  Center,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  useDisclosure,
  useToast
} from '@chakra-ui/core';
import { AddIcon } from '@chakra-ui/icons';
import { Form, Formik } from 'formik';

const WorkersTableRow = ({ worker, onClickDelete }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      as="tr"
      bg={isHovering ? 'gray.100' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Box as="td" textAlign="left" p={2}>{worker.name}</Box>
      <Box as="td" textAlign="center">{worker.deliveriesCount}</Box>
      <Box as="td" textAlign="center">
        <DeleteButton
          header="Deletar Empregado"
          onDelete={() => onClickDelete(worker.name)}
        />
      </Box>
    </Box>
  );
};

const WorkersTable = ({ workers, onClickDelete }) => (
  <Box as="table">
    <Box as="thead">
      <Box as="tr">
        <Box as="th" textAlign="left" p={2}>Nome</Box>
        <Box as="th" textAlign="center">Entreguas</Box>
        <Box as="th" textAlign="center">Açoes</Box>
      </Box>
    </Box>
    <Box as="tbody">
      {workers.map((worker) => (
        <WorkersTableRow
          worker={worker}
          onClickDelete={onClickDelete} 
        />
      ))}
    </Box>
  </Box>
);

const WorkerForm = (props) => (
  <Drawer
    isOpen={props.isOpen}
    onClose={props.onClose}
    finalFocusRef={props.btnRef}
    placement="right"
  >
    <Formik
      initialValues={{ name: '', phones: [], addresses: [] }}
      onSubmit={(values) => {
        fetch('/api/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        })
        .then(res => res.json())
        .then(worker => {
          props.toast({
            title: 'Criado com sucesso.',
            status: 'success',
            duration: 2000,
            isClosable: true
          });
          props.workers.push(worker);
          props.onClose();
        });
      }}
    >
      {({
        isSubmitting,
        handleChange,
        handleBlur
      }) => (
        <Form>
          <DrawerOverlay>
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>
                Registrar Funcionario
              </DrawerHeader>

              <DrawerBody>
                <FormControl>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    name="name"
                    type="text"
                    onChange={handleChange}
                    handleBlur={handleBlur}
                  />
                </FormControl>
              </DrawerBody>

              <DrawerFooter>
                <Button mr={3} onClick={props.onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isDisabled={isSubmitting}
                >
                  Adicionar
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </DrawerOverlay>
        </Form>
      )}
    </Formik>
  </Drawer>
);

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const btnRef = createRef();

  const onClickDelete = (worker) => {
    fetch(`/api/workers/${worker}`, { method: 'DELETE' })
    .then(_res => {
      setWorkers(workers.filter((w) => w.name !== worker));
      toast({
        title: 'Deletado com sucesso.',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    });
  };

  useEffect(() => {
    setIsFetching(true);
    fetch(`/api/workers`)
    .then(res => res.json())
    .then(workers => {
      setWorkers(workers);
      setIsFetching(false);
    });
  }, []);

  return (
    <Box>
      <Flex
        p={4}
        bg="blue.400"
        justifyContent="space-between"
        alignItems="center"
        color="white"
      >
        <Box
          as="span"
          fontSize="2rem"
          fontWeight="semibold"
        >
          Funcionários
        </Box>
        <AddIcon
          ref={btnRef}
          onClick={onOpen}
          fontSize="1.5rem"
          cursor="pointer"
        />
      </Flex>

      <Box p={4} pt={1} pb={1}>
        {isFetching ? <Center><Spinner /></Center> : workers.length === 0 ? (
          <Center>Nenhum funcionario</Center>
        ) : (
          <WorkersTable
            workers={workers}
            onClickDelete={onClickDelete}
          />
        )}
      </Box>

      <WorkerForm
        workers={workers}
        isOpen={isOpen}
        onClose={onClose}
        finalFocusRef={btnRef}
        toast={toast}
      />
    </Box>
  );
};