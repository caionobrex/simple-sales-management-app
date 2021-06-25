import React, { useState, useEffect } from 'react';
import { FloatingButton, ItemList, SearchBox } from '.';
import { useHistory } from 'react-router';
import {
  Box,
  Flex,
  NumberInput,
  NumberInputField,
  Spinner,
  Button,
  useToast,
  Grid
} from '@chakra-ui/core';
import moment from 'moment';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import Pagination from './Pagination';

const ProductTableRow = ({ product, isSelected, pickItem }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Flex
      justifyContent="space-between"
      cursor="pointer"
      p={3}
      bg={[isSelected ? 'green.200' : '', isSelected || isHovering ? 'green.200' : '']}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => pickItem(product._id)}
    >
      <Box flex="0 70%">{product.name}</Box>

      <Box flex="0 25%">
        {
          !hasDiscountToday(product) ? `R$ ${product.price.toFixed(2)}` :
          product.discounts.map((discount) => {
            if (discount.discountDay === new Date(Date.now()).getDay())
              return `R$ ${discount.discountedPrice.toFixed(2)}`
          })
        }
      </Box>

      <Box
        flex="1"
        textAlign="center"
        color={product.qty === 0 ? 'red.400' : ''}
      >
        {product.qty}
      </Box>
    </Flex>
  );
};

const ProductTable = (props) => (
  <Grid rowGap={3}>
    {props.products.map((product) => {
      if (props.items.filter((item) => product.name === item.name).length > 0) {
        return (
          <ProductTableRow
            product={product}
            pickItem={props.pickItem}
            isSelected
          />
        );
      }
      return (
        <ProductTableRow
          product={product}
          pickItem={props.pickItem}
        />
      );
    })}
  </Grid>
);

const SideNav = (props) => (
  <Box
    pos="fixed"
    d={[props.isOpen ? 'block' : 'none', 'block']}
    w={['100%', '35%']}
    h="100%"
    bg="white"
    overflowY="scroll"
    zIndex={['1500', '1']}
  >
    {props.isFetching ? (
      <Flex
        h="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner />
      </Flex>
    ) : (
      <Box>
        <CloseIcon
          d={["inline-block", "none"]}
          pos="fixed"
          top="0"
          right="0"
          onClick={() => props.setIsOpen(false)}
        />

        <Box p={1}>
          <SearchBox onSearch={props.onSearchHandle} />
        </Box>

        <Box mt={2}>
          <ProductTable {...props} />
          <Box p={3}>
            <Pagination
              nOfPages={Math.ceil(props.totalCount / 30)}
              currentPage={props.currentPage}
              onClick={props.setCurrentPage}
            />
          </Box>
        </Box>
      </Box>
    )}
  </Box>
);

const OrderMakerFooter = ({ order, applyDiscount, onSubmitOrder }) => (
  <Flex
    as="footer"
    flexDirection={["column", "row"]}
    justifyContent={["space-between"]}
    alignItems={["flex-start", "center"]}
    borderTop="1px"
    borderColor="gray.300"
    p={4}
  >
    <NumberInput
      min={0}
      max={100}
      mb={[5, 0]}
      width={["100%", "auto"]}
      onChange={applyDiscount}
      isDisabled={order.items.length === 0}
    >
      <NumberInputField placeholder="Desconto" />
    </NumberInput>
    <Box as="span" mb={[5, 0]}>Entregador: {order.deliveredBy}</Box>
    <Button
      colorScheme="blue"
      width={["100%", "auto"]}
      disabled={order.items.length === 0}
      onClick={onSubmitOrder}
    >
      Finalizar Pedido
    </Button>
  </Flex>
);

export default function OrderMaker(props) {
  const [products, setProducts] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [order, setOrder] = useState({
    items: [],
    anotations: [],
    deliveredBy: 'Nenhum',
    discount: 0,
    total: 0
  });
  const { client } = props.match.params;
  const toast = useToast();
  const history = useHistory();

  const pickItem = (id) => {
    products.forEach((product) => {
      if (product._id === id) {
        if (product.qty === 0) return toast({
          title: 'Sem stock',
          description: 'O produto selecionado está fora de stock.',
          status: 'error',
          duration: 1000,
          isClosable: true
        });

        if (hasItem(product.name)) return;

        const item = {
          name: product.name,
          price: getDiscountedPrice(product),
          qty: 1,
          subTotal: getDiscountedPrice(product)
        };
        setOrder({
          ...order,
          items: [item, ...order.items],
          total: calcTotal([...order.items, item])
        });
        product.qty -= 1;
      }
    })
  };

  const pickWorker = (worker) => {
    setOrder({ ...order, deliveredBy: worker.name });
  };

  const changeQty = (name, qty) => {
    if (!productHasStock(name, qty)) return toast({
      title: 'Sem stock',
      description: 'O produto selecionado está fora de stock.',
      status: 'error',
      isClosable: true
    });
    
    products.forEach((product) => {
      if (product.name === name)
        product.qty = product.stock - qty;
    });

    const items = order.items.map((item) => {
      if (item.name === name) {
        item.qty = qty;
        item.subTotal = item.price * qty;
      }
      return item;
    });
    setOrder({
      ...order,
      items,
      total: calcTotal(items)
    });
  };

  const deleteItem = (name) => {
    if (!hasItem(name)) return;
    
    const items = order.items.filter((item) => item.name !== name);
    products.forEach((product) => {
      if (product.name === name) product.qty = product.stock;
    });
    setOrder({
      ...order,
      items,
      total: calcTotal(items)
    });
  };

  const hasItem = (name) => {
    let hasItem = false;
    order.items.forEach((item) => {
      if (item.name === name) hasItem = true;
    });
    return hasItem;
  };

  const productHasStock = (name, qty) => {
    let hasStock = true;
    products.forEach((product) => {
      if (product.name === name)
        if (qty > product.stock) hasStock = false;
    });
    return hasStock;
  };

  const calcTotal = (items) => {
    let total = 0;
    items.forEach((item) => total += item.price * item.qty);
    return total;
  };

  const applyDiscount = (discountValue) => {
    const total = calcTotal(order.items);
    if (!discountValue || discountValue < 0 || discountValue > order.total) {
      return setOrder({
        ...order,
        discount: 0,
        total
      });
    }
    setOrder({
      ...order,
      discount: discountValue,
      total: total - discountValue
    });
  };

  const onSearchHandle = (searchValue) => {
    const handleThen = (products) => {
      products.products = products.products.map((product) => {
        if (!hasItem(product.name)) {
          product.qty = product.stock;
          return product;
        }
        for (const item of order.items) {
          if (item.name === product.name) {
            product.qty = product.stock - item.qty;
            return product;
          }
        }
      });
      setProducts(products.products);
    };

    if (!searchValue) {
      fetch(`/api/products?page=${currentPage}&nPerPage=30`)
      .then(res => res.json())
      .then(handleThen);
    } else {
      fetch(`/api/products/search?query=${searchValue}`)
      .then(res => res.json())
      .then(handleThen);
    }
  };

  const onSubmitOrder = () => {
    if (order.items.length === 0) return;
    fetch(`/api/clients/${client}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    })
    .then(res => res.json())
    .then(_order => {
      history.push('/orders');
    });
  };

  useEffect(() => {
    setIsFetching(true);
    Promise.all([
      fetch(`/api/products?page=${currentPage}&nPerPage=30`).then(res => res.json()),
      fetch('/api/workers').then(res => res.json()),
    ]).then(([ products, workers ]) => {
      products.products = products.products.map((product) => {
        product.qty = product.stock;
        return product;
      });
      setTotalCount(products.totalCount);
      setProducts(products.products);
      setWorkers(workers);
      setIsFetching(false);
    });
  }, [currentPage]);

  useEffect(() => {
    document.body.style.overflowY = 'hidden';
    return () => document.body.style.overflowY = 'auto';
  }, []);

  useEffect(() => {
    function onKeyUpHandle(event) {
      if (event.keyCode === 27) {
        history.push(`/clients/${client}/orders`);
        document.body.style.overflowY = 'auto';
      }
    }
    document.addEventListener('keyup', onKeyUpHandle);
    return () => document.removeEventListener('keyup', onKeyUpHandle);
  });

  return (
    <Flex
      pos="fixed"
      top="0"
      left="0"
      w="100%"
      h="100%"
      bg="white"
      zIndex="1200"
      overflowY="scroll"
    >
      <SideNav
        products={products}
        workers={workers}
        items={order.items}
        deliveredBy={order.deliveredBy}
        pickItem={pickItem}
        pickWorker={pickWorker}
        totalCount={totalCount}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onSearchHandle={onSearchHandle}
        isFetching={isFetching}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <Box
        ml={['0', '35%']}
        w={['100%', '75%']}
        h="100%"
      >
        <Flex
          as="header"
          p="4"
          justifyContent="space-between"
          alignItems={["flex-start", "center"]}
          fontWeight="semibold"
          fontSize={['1rem', '1.2rem']}
          bg="blue.400"
          color="white"
        >
          <Box as="span">Para {client}</Box>
          <Box as="span">Total: R$ {order.total.toFixed(2)}</Box>
        </Flex>

        <Box as="main" minH="100vh" p="4" pb="6">
          <Box as="p" fontWeight="semibold" mb={2}>
            Items: {order.items.length}
          </Box>
          {order.items.length === 0 ? (
            <Flex
              mt={5}
              minH="100vh"
              fontSize="1.5rem"
              justifyContent="center"
              alignItems="center"
            >
              Nenhum Item
            </Flex>
          ) : (
            <ItemList
              items={order.items}
              changeQty={changeQty}
              deleteItem={deleteItem}
            />
          )}
        </Box>

        <OrderMakerFooter
          order={order}
          applyDiscount={applyDiscount}
          onSubmitOrder={onSubmitOrder}
        />
      </Box>

      <Box d={["inline", "none"]}>
        <FloatingButton onClick={() => setIsOpen(true)}>
          <AddIcon color="white" />
        </FloatingButton>
      </Box>
    </Flex>
  );
};

const hasDiscountToday = (product) => {
  const today = moment().day();
  const filter = (discount) => discount.discountDay === today;
  return product.discounts.filter(filter).length;
};

const getDiscountedPrice = (product) => {
  if (!hasDiscountToday(product)) return product.price;
  const today = new Date(Date.now()).getDay();
  let discountedPrice = 0;
  product.discounts.forEach((discount) => {
    if (discount.discountDay === today)
      discountedPrice = discount.discountedPrice;
  });
  return discountedPrice;
};