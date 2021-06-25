import React, { createRef, useEffect, useState } from 'react';
import { DeleteButton, SearchBox, Pagination, FloatingButton, OpenMobileNavBtn } from '../components';
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
  Grid,
  useDisclosure,
  useToast,
} from '@chakra-ui/core';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { Form, Formik } from 'formik';
import { useHistory } from 'react-router';
import moment from 'moment';

const ClientCard = ({ client, onClickEdit, onClickDelete }) => {
  const history = useHistory();

  return (
    <Box boxShadow="md">
      <Flex
        as="header"
        justifyContent="space-between"
        fontWeight="semibold"
        cursor="pointer"
        color="white"
        p={4}
        bg={isClientBirthDay(client) ? 'green.300' : client.debt > 0 ? 'red.300' : 'blue.300'}
        onClick={() => history.push(`/clients/${client.name}/orders`)}
      >
        <Box>{client.name}</Box>
        <Box>{client.birthday}</Box>
      </Flex>

      <Box as="main" p={5}>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">CPF: </Box> {client.cpf}
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Endereço: </Box> {client.addresses[0].street}
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Pedidos: </Box> {client.ordersCount}
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Débito: </Box> R$ {client.debt.toFixed(2)}
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Telefone: </Box> {client.phones[0]}
        </Box>
      </Box>

      <Flex
        as="footer"
        justifyContent="space-between"
        borderTop="1px"
        borderColor="gray.200"
        p={4}
      >
        <EditIcon
          color="teal.500"
          cursor="pointer"
          mr={2}
          onClick={() => onClickEdit(client)}
        />
        <DeleteButton
          header="Deletar Cliente"
          onDelete={() => onClickDelete(client.name)}
        />
      </Flex>
    </Box>
  );
};

const ClientList = ({ clients, onClickEdit, onClickDelete }) => (
  <Grid
    templateColumns={["100%", "repeat(3, 1fr)"]}
    columnGap={3}
    rowGap={5}
  >
    {clients.map((client) => (
      <ClientCard
        client={client}
        onClickEdit={onClickEdit}
        onClickDelete={onClickDelete}
      />
    ))}
  </Grid>
);

const ClientForm = (props) => (
  <Drawer
    isOpen={props.isOpen}
    onClose={props.onClose}
    finalFocusRef={props.btnRef}
    placement="right"
    size="md"
  >
    <Formik initialValues={props.initialValues} onSubmit={props.onSubmitHandle}>
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
                {props.isEditing ? 'Editar Cliente' : 'Registrar Cliente'}
              </DrawerHeader>

              <DrawerBody>
                <Grid
                  templateColumns="repeat(2, 1fr)"
                  rowGap={5}
                  columnGap={3}
                >
                  <FormControl>
                    <FormLabel>Nome</FormLabel>
                    <Input
                      name="name"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.name}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CPF</FormLabel>
                    <Input
                      name="cpf"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.cpf}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Input
                      name="birthday"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.birthday}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Telefone</FormLabel>
                    <Input
                      name="phone"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.phone}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Rua</FormLabel>
                    <Input
                      name="street"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.street}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Cidade</FormLabel>
                    <Input
                      name="city"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.city}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Estado</FormLabel>
                    <Input
                      name="state"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.state}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>CEP</FormLabel>
                    <Input
                      name="cep"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      defaultValue={props.initialValues.cep}
                    />
                  </FormControl>
                </Grid>
              </DrawerBody>

              <DrawerFooter>
                <Button onClick={props.onClose} mr={3}>Cancelar</Button>
                <Button
                  type="submit"
                  colorScheme="teal"
                  disabled={isSubmitting}
                >
                  {props.isEditing ? 'Editar' : 'Salvar'}
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </DrawerOverlay>
        </Form>
      )}
    </Formik>
  </Drawer>
);

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [initialValues, setInitialValues] = useState({
    name: '',
    cpf: '',
    birthday: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    cep: ''
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const btnRef = createRef();

  const onClickEdit = (client) => {
    setInitialValues({
      id: client.name,
      name: client.name,
      cpf: client.cpf,
      birthday: client.birthday,
      phone: client.phones[0],
      street: client.addresses[0].street,
      city: client.addresses[0].city,
      state: client.addresses[0].state,
      cep: client.addresses[0].cep
    });
    setIsEditing(true);
    onOpen();
  };

  const onClickDelete = (name) => {
    fetch(`/api/clients/${name}`, { method: 'DELETE' })
    .then(_res => {
      setClients(
        clients.filter((client) => client.name !== name)
      );
    });
  };

  const onClickHandle = () => {
    setIsEditing(false);
    setInitialValues({
      name: '',
      cpf: '',
      birthday: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      cep: ''
    });
    onOpen();
  };

  const onSearchHandle = (searchValue) => {
    setIsFetching(true);
    if (searchValue.length === 0) {
      fetch('/api/clients')
      .then(res => res.json())
      .then(clients => {
        setClients(clients.clients);
        setIsFetching(false);
      });
    } else {
      fetch(`/api/clients/search?searchBy=1&query=${searchValue}`)
      .then(res => res.json())
      .then(clients => {
        setClients(clients);
        setIsFetching(false);
      });
    }
  };

  const onSubmitHandle = (values, { setSubmitting }) => {
    setSubmitting(true);
    setIsFetching(true);
    if (isEditing) { // Update client
      fetch (`/api/clients/${values.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          cpf: values.cpf,
          birthday: values.birthday,
          phones: values.phone,
          addresses: [{
            street: values.street,
            city: values.city,
            state: values.state,
            cep: values.cep
          }]
        })
      })
      .then(_res => {
        onClose();
        setIsFetching(false);
      });
    } else { // Create a new one
      fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          cpf: values.cpf,
          birthday: values.birthday,
          phones: values.phone,
          addresses: [{
            street: values.street,
            city: values.city,
            state: values.state,
            cep: values.cep
          }]
        })
      })
      .then(res => res.json())
      .then(client => {
        setSubmitting(false);
        onClose();
        toast({
          title: `Client ${client.name} criado com sucesso.`,
          description: '',
          status: 'success',
          duration: 3000,
          isClosable: true
        });
        setClients([...clients, client]);
        setTotalCount(totalCount + 1);
        setIsFetching(false);
      });
    }
  };

  useEffect(() => {
    setIsFetching(true);
    fetch(`/api/clients?page=${currentPage}`)
    .then(res => res.json())
    .then(clients => {
      setClients(clients.clients);
      setTotalCount(clients.totalCount);
      setIsFetching(false);
    });
  }, [currentPage]);

  return (
    <>
      <Flex
        as="header"
        bg="blue.400"
        justifyContent="space-between"
        alignItems="center"
        color="white"
        p={4}
      >
        <Box
          as="span"
          fontSize={['1.5rem', '2rem']}
          fontWeight="semibold"
        >
          Clientes / {totalCount}
        </Box>

        <Box w="60%" d={['none', 'block']}>
          <SearchBox onSearch={onSearchHandle} />
        </Box>
        
        <Box><OpenMobileNavBtn /></Box>
      </Flex>

      <Box p={4} mt={2} pb="4rem">
        <Box d={['block', 'none']} mb={6}>
          <SearchBox onSearch={onSearchHandle} />
        </Box>
        {isFetching ? <Center><Spinner /></Center> : (
          <>
            <ClientList
              clients={clients}
              onClickEdit={onClickEdit}
              onClickDelete={onClickDelete}
            />
            <Box mt={4}>
              <Pagination
                currentPage={currentPage}
                nOfPages={Math.ceil(totalCount) / 15}
                onClick={(page) => setCurrentPage(page)}
              />
            </Box>
          </>
        )}
      </Box>

      <ClientForm
        isOpen={isOpen}
        onClose={onClose}
        initialValues={initialValues}
        isEditing={isEditing}
        btnRef={btnRef}
        onSubmitHandle={onSubmitHandle}
      />

      <FloatingButton onClick={onClickHandle}>
        <AddIcon ref={btnRef} color="white" />
      </FloatingButton>
    </>
  );
};

const isClientBirthDay = (client) => {
  const now = moment();
  const today = `${now.date()}/${now.month() + 1}`;
  const clientBirthDay = `${moment(client.birthday, 'DD MM YYYY').date()}/${moment(client.birthday, 'DD MM YYYY').month() + 1}`;
  return clientBirthDay === today;
};