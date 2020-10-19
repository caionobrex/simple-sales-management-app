import React, { createRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DeleteButton, SearchBox, Pagination } from '../components';
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
  useToast,
} from '@chakra-ui/core';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { Form, Formik } from 'formik';
import moment from 'moment';

const ProductsTableRow = ({
  product,
  setInitialValues,
  setIsEditing,
  onOpen,
  onClickDelete
}) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      as="tr"
      bg={product.stock === 0 ? 'red.200' : hasDiscountToday(product) ? 'green.200' : isHovering ? 'gray.100' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      >
      <Box as="td" textAlign="left" p={2}>
        <Link to={`/products/${product._id}`}>{product.name}</Link>
      </Box>
      <Box as="td" textAlign="center">
        {
          !hasDiscountToday(product) ? `R$ ${product.price.toFixed(2)}` :
          product.discounts.map((discount) => {
            if (discount.discountDay === new Date(Date.now()).getDay())
              return `R$ ${discount.discountedPrice.toFixed(2)}`
          })
        }
      </Box>
      <Box as="td" textAlign="center">R$ {product.price.toFixed(2)}</Box>
      <Box as="td" textAlign="center">
        {
          !hasDiscountToday(product) ? `0%` :
          product.discounts.map((discount) => {
            if (discount.discountDay === new Date(Date.now()).getDay())
              return `${Math.round(discount.discount)}%`
          })
        }
      </Box>
      <Box as="td" textAlign="center">{product.stock}</Box>
      <Box as="td" textAlign="center">{product.sales}</Box>
      <Box as="td" textAlign="center">
        <EditIcon
          color="teal.500"
          cursor="pointer"
          mr={2}
          onClick={() => {
            setInitialValues({
              id: product._id,
              name: product.name,
              price: product.price,
              stock: product.stock
            });
            setIsEditing(true);
            onOpen();
          }}
        />
        <DeleteButton
          header="Deletar Produto"
          onDelete={() => onClickDelete(product._id)}
        />
      </Box>
    </Box>
  );
};

const ProductsTable = (props) => (
  <Box as="table">
    <Box as="thead">
      <Box as="tr">
        <Box as="th" textAlign="left">Produto</Box>
        <Box as="th" textAlign="center">Preço Hoje</Box>
        <Box as="th" textAlign="center">Preço Normal</Box>
        <Box as="th" textAlign="center">Desconto Hoje</Box>
        <Box as="th" textAlign="center">Stock</Box>
        <Box as="th" textAlign="center">Vendas</Box>
        <Box as="th" textAlign="center">Ações</Box>
      </Box>
    </Box>
    <Box as="tbody">
      {props.products.map((product) => (
        <ProductsTableRow
          product={product}
          setInitialValues={props.setInitialValues}
          setIsEditing={props.setIsEditing}
          onOpen={props.onOpen}
          onClickDelete={props.onClickDelete}
        />
      ))}
    </Box>
  </Box>
);

const ProductForm = (props) => (
  <Drawer
    isOpen={props.isOpen}
    onClose={props.onClose}
    finalFocusRef={props.btnRef}
    placement="right"
  >
    <Formik initialValues={props.initialValues} onSubmit={props.onSubmitHandle}>
      {({
        isSubmitting,
        handleChange,
        handleBlur,
      }) => (
        <Form>
          <DrawerOverlay>
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>
                {props.isEditing ? 'Editar Produto' : 'Novo Produto'}
              </DrawerHeader>

              <DrawerBody>
                <FormControl mb={3} isRequired>
                  <FormLabel>Nome</FormLabel>
                  <Input
                    name="name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    defaultValue={props.initialValues.name}
                  />
                </FormControl>
                <FormControl mb={3} isRequired>
                  <FormLabel>Preço</FormLabel>
                  <Input
                    name="price"
                    type="number"
                    step="0.1"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    defaultValue={props.initialValues.price}
                  />
                </FormControl>
                <FormControl mb={3}>
                  <FormLabel>Stock</FormLabel>
                  <Input
                    name="stock"
                    type="number"
                    defaultValue={props.initialValues.stock}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </FormControl>
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

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialValues, setInitialValues] = useState({ name: '', price: 0, stock: 0 });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const btnRef = createRef();

  const onClickDelete = (id) => {
    setIsFetching(true);
    fetch(`/api/products/${id}`, { method: 'DELETE'})
    .then(_res => {
      setProducts(products.filter((product) => product._id !== id));
      setIsFetching(false);
    });
  };

  const onClickHandle = () => {
    setIsEditing(false);
    setInitialValues({ name: '', price: 0, stock: 0 });
    onOpen();
  };

  const onSearchHandle = (searchValue) => {
    setIsFetching(true);
    if (!searchValue) {
      fetch(`/api/products?page=${currentPage}`)
      .then(res => res.json())
      .then(products => {
        setProducts(products.products);
        setTotalCount(products.totalCount);
        setIsFetching(false);
      });
    } else {
      fetch(`/api/products/search?query=${searchValue}`)
      .then(res => res.json())
      .then(products => {
        setProducts(products.products);
        setIsFetching(false);
      });
    }
  };

  const onSubmitHandle = (values, { setSubmitting }) => {
    setSubmitting(true);
    if (isEditing) { // Update the product
      fetch(`/api/products/${values.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      .then(_res => {
        products.forEach((product) => {
          if (product._id === values.id) {
            product.name = values.name;
            product.price = values.price;
            product.stock = values.stock;
          }
        });
        onClose();
        toast({
          title: 'Produto Editado Com Sucesso.',
          status: 'success',
          duration: 2000,
          isClosable: true
        });
        setSubmitting(false);
      });
    } else { // Create a new one
      fetch(`/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })
      .then(res => res.json())
      .then(product => {
        products.push(product);
        onClose();
        toast({
          title: 'Produto Criado Com Sucesso.',
          status: 'success',
          duration: 2000,
          isClosable: true
        });
        setSubmitting(false);
      });
    }
  };

  useEffect(() => {
    setIsFetching(true);
    fetch(`/api/products?page=${currentPage}`)
    .then(res => res.json())
    .then(products => {
      setProducts(products.products);
      setTotalCount(products.totalCount);
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
          fontSize="2rem"
          fontWeight="semibold"
        >
          Produtos / {totalCount}
        </Box>

        <Box flex="0 0 60%" d={['none', 'block']}>
          <SearchBox onSearch={onSearchHandle} />
        </Box>

        <AddIcon
          ref={btnRef}
          cursor="pointer"
          fontSize="1.5rem"
          onClick={onClickHandle}
        />
      </Flex>

      <Box p={4}>
        {isFetching ? <Center><Spinner /></Center> : (
          <ProductsTable
            products={products}
            setInitialValues={setInitialValues}
            setIsEditing={setIsEditing}
            onOpen={onOpen}
            onClickDelete={onClickDelete}
          />
        )}

        <Box mt={2}>
          <Pagination
            currentPage={currentPage}
            nOfPages={Math.ceil(totalCount / 15)}
            onClick={(page) => setCurrentPage(page)}
          />
        </Box>
      </Box>

      <ProductForm
        isOpen={isOpen}
        onClose={onClose}
        btnRef={btnRef}
        initialValues={initialValues}
        isEditing={isEditing}
        onSubmitHandle={onSubmitHandle}
      />
    </>
  );
};

const hasDiscountToday = (product) => {
  if (product.discounts.length === 0) return false;
  const today = moment().day();
  const filter = (discount) => discount.discountDay === today;
  return product.discounts.filter(filter).length;
};