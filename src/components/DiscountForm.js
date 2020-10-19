import React, { useState } from 'react';
import { useHistory } from 'react-router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Select
} from "@chakra-ui/core";

export default function DiscountForm({ product, days }) {
  const [discountDay, setDiscountDay] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(product.price.toFixed(2));
  const history = useHistory();

  const onChangeHandle = (event) => setDiscountDay(event.currentTarget.value);

  const onDiscountChange = (discountValue) => {
    if (!discountValue) return setDiscount(discountValue);
    if (discountValue < 0 || discountValue > 100) return setDiscount(0);
    const discounted = product.price - (discountValue * product.price) / 100;
    setDiscount(discountValue);
    setDiscountedPrice(discounted.toFixed(2));
  };

  const onDiscountedPriceChange = (value) => {
    setDiscount((100 - (value / product.price) * 100));
    setDiscountedPrice(value);
  };

  const onSubmitHandle = (event) => {
    event.preventDefault();
    fetch(`/api/products/${product._id}/discounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discountDay, discount, discountedPrice })
    })
    .then(res => res.json())
    .then(discount => {
      product.discounts.push(discount);
      history.push(`/products/${product._id}`);
    });
  };

  return (
    <Box as="form" onSubmit={onSubmitHandle}>
      <FormControl mb={3}>
        <FormLabel>Dia</FormLabel>
        <Select onChange={onChangeHandle}>
          {days.map((day, index) => (
            <Box
              as="option"
              value={index}
              selected={day === index}
            >
              {day}
            </Box>
          ))}
        </Select>
      </FormControl>

      <FormControl mb={3}>
        <FormLabel>Preço Normal</FormLabel>
        <NumberInput
          min={0}
          value={product.price.toFixed(2)}
          isDisabled
        >
          <NumberInputField />
        </NumberInput>
      </FormControl>

      <FormControl mb={3}>
        <FormLabel>Desconto</FormLabel>
        <NumberInput
          min={0}
          defaultValue={0}
          value={discount}
          onChange={onDiscountChange}
        >
          <NumberInputField />
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>Preço Descontado</FormLabel>
        <NumberInput
          value={discountedPrice}
          min={0}
          step={0.1}
          max={product.price}
          onChange={onDiscountedPriceChange}
        >
          <NumberInputField />
        </NumberInput>
      </FormControl>

      <Button
        mt={4}
        type="submit"
        colorScheme="blue"
      >
        Criar Desconto
      </Button>
    </Box>
  );
};