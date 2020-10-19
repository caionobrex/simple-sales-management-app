import React, { useEffect, useState } from 'react';
import { Link, Route, useHistory } from 'react-router-dom';
import { DeleteButton, DiscountForm } from '../components';
import { Box, Button, Flex } from '@chakra-ui/core';
import { CloseIcon } from '@chakra-ui/icons';

const DiscountFormContainer = ({ history, product, days }) => {

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    function onKeyDownHandler(event) {
      if (event.keyCode === 27) history.goBack();
    }

    document.addEventListener('keydown', onKeyDownHandler);
    return () => document.removeEventListener('keydown', onKeyDownHandler);
  });

  return (
    <Flex
      pos="fixed"
      top="0"
      left="0"
      w="100%"
      h="100%"
      justifyContent="center"
      alignItems="center"
      bg="rgba(0,0,0,0.1)"
    >
      <Box p={4} w="450px" bg="white" pos="relative">
        <CloseIcon
          pos="absolute"
          cursor="pointer"
          top={2}
          right={2}
          onClick={() => history.goBack()}
        />
        <DiscountForm product={product} days={days} />
      </Box>
    </Flex>
  );
};

const ProductDiscountsTable = ({ product, days, onClickDelete }) => (
  <Box as="table" mt={2}>
    <Box as="thead">
      <Box as="tr">
        <Box as="th" textAlign="left">Dia</Box>
        <Box as="th" textAlign="center">Desconto</Box>
        <Box as="th" textAlign="center">Preço Descontado</Box>
        <Box as="th" textAlign="center">Ações</Box>
      </Box>
    </Box>
    <Box as="tbody">
      {product.discounts.map((discount) => (
        <Box as="tr">
          <Box as="td" textAlign="left">{days[discount.discountDay]}</Box>
          <Box as="td" textAlign="center">{Math.round(discount.discount)}%</Box>
          <Box as="td" textAlign="center">R$ {discount.discountedPrice.toFixed(2)}</Box>
          <Box as="td" textAlign="center">
            <DeleteButton
              header="Deletar Desconto"
              onDelete={() => onClickDelete(discount._id)} 
            />
          </Box>
        </Box>
      ))}
    </Box>
  </Box>
);

export default function ProductPage(props) {
  const [product, setProduct] = useState({});
  const [isFetching, setIsFetching] = useState(true);
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
  const history = useHistory();
  const { id } = props.match.params;

  const onClickDelete = (discountId) => {
    setProduct(product)
    fetch(`/api/products/${id}/discounts/${discountId}`, { method: 'DELETE' })
    .then(_res => {
      const discounts = product.discounts.filter((discount) => discount._id !== discountId);
      setProduct({ ...product, discounts });
    });
  };

  useEffect(() => {
    setIsFetching(true);
    fetch(`/api/products/${id}`)
    .then(res => res.json())
    .then(product => {
      setProduct(product);
      setIsFetching(false);
    });
  }, [id]);

  return (
    <Box p={2}>
      {isFetching ? null : (
        <>
          <Route
            path="/products/:id/discounts/add"
            component={() => (
              <DiscountFormContainer
                product={product}
                history={history}
                days={days}
              />
            )}
          />

          <Box>
            <Link to={`/products/${id}/discounts/add`}>
              <Button colorScheme="blue">Add Desconto</Button>
            </Link>
            <ProductDiscountsTable
              product={product}
              days={days}
              onClickDelete={onClickDelete}
            />
          </Box>
        </>
      )}
    </Box>
  );
};