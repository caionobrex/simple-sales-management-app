import React, { createRef, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  Grid,
  Input,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/core';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { Form, Formik } from 'formik';
import moment from 'moment';

const ProductCard = ({
  product,
  setInitialValues,
  setIsEditing,
  onOpen,
  onClickDelete
}) => {
  const history = useHistory();

  return (
    <Box boxShadow="md">
      <Box
        as="header"
        color="white"
        fontWeight="semibold"
        cursor="pointer"
        bg={product.stock === 0 ? 'red.300' : hasDiscountToday(product) ? 'green.300' : 'blue.300'}
        p={4}
        onClick={() => history.push(`/products/${product._id}`)}
      >
        <Box as="span">{product.name}</Box>
      </Box>

      <Box as="main" p={5}>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Preço Hoje: </Box>
          {
            !hasDiscountToday(product) ? `R$ ${product.price.toFixed(2)}` :
            product.discounts.map((discount) => {
              if (discount.discountDay === new Date(Date.now()).getDay())
                return `R$ ${discount.discountedPrice.toFixed(2)}`
            })
          }
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Preço Normal: </Box>
          R$ {product.price.toFixed(2)}
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Desconto Hoje: </Box>
          {
            !hasDiscountToday(product) ? `0%` :
            product.discounts.map((discount) => {
              if (discount.discountDay === new Date(Date.now()).getDay())
                return `${Math.round(discount.discount)}%`
            })
          }
        </Box>
        <Box as="p" mb={4}>
          <Box as="span" color="gray.500">Stock:</Box> {product.stock}
        </Box>
        <Box as="p">
          <Box as="span" color="gray.500">
          Vendas:</Box> {product.sales}
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
      </Flex>
    </Box>
  );
};

const ProductList = (props) => (
  <Grid templateColumns={['100%', 'repeat(3, 1fr)']} gap={4}>
    {props.products.map((product) => (
      <ProductCard
        product={product}
        setInitialValues={props.setInitialValues}
        setIsEditing={props.setIsEditing}
        onOpen={props.onOpen}
        onClickDelete={props.onClickDelete}
      />
    ))}
  </Grid>
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
          fontSize={["1.4rem", "2rem"]}
          fontWeight="semibold"
        >
          Produtos / {totalCount}
        </Box>

        <Box flex="0 0 60%" d={['none', 'block']}>
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
            <ProductList
              products={products}
              setInitialValues={setInitialValues}
              setIsEditing={setIsEditing}
              onOpen={onOpen}
              onClickDelete={onClickDelete}
            />
            <Box mt={4}>
              <Pagination
                currentPage={currentPage}
                nOfPages={Math.ceil(totalCount / 15)}
                onClick={(page) => setCurrentPage(page)}
              />
            </Box>
          </>
        )}
      </Box>

      <ProductForm
        isOpen={isOpen}
        onClose={onClose}
        btnRef={btnRef}
        initialValues={initialValues}
        isEditing={isEditing}
        onSubmitHandle={onSubmitHandle}
      />

      <FloatingButton onClick={onClickHandle}>
        <AddIcon ref={btnRef} color="white" />
      </FloatingButton>
    </>
  );
};

const hasDiscountToday = (product) => {
  if (product.discounts.length === 0) return false;
  const today = moment().day();
  const filter = (discount) => discount.discountDay === today;
  return product.discounts.filter(filter).length;
};