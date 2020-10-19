import React, { useState, useEffect } from 'react';
import { ItemsTable, SearchBox } from '.';
import { useHistory } from 'react-router';
import {
  Box,
  Flex,
  NumberInput,
  NumberInputField,
  Spinner,
  Button,
  useToast
} from '@chakra-ui/core';
import moment from 'moment';

const ProductTableRow = ({ product, isSelected, pickItem }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      as="tr"
      p="1rem"
      cursor="pointer"
      bg={isSelected || isHovering ? 'green.200' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => pickItem(product._id)}
    >
      <Box as="td" textAlign="left" p={2}>{product.name}</Box>
      <Box as="td" textAlign="left">
        {
          !hasDiscountToday(product) ? `R$ ${product.price.toFixed(2)}` :
          product.discounts.map((discount) => {
            if (discount.discountDay === new Date(Date.now()).getDay())
              return `R$ ${discount.discountedPrice.toFixed(2)}`
          })
        }
      </Box>
      <Box
        as="td"
        textAlign="center"
        color={product.qty === 0 ? 'red.400' : ''}
      >
        {product.qty}
      </Box>
    </Box>
  );
};

const ProductTable = (props) => (
  <Box as="table">
    <Box as="thead">
      <Box as="tr">
        <Box as="th" pl="2" pr="2" textAlign="left">Produto</Box>
        <Box as="th" textAlign="left">Preço</Box>
        <Box as="th" textAlign="center">Stock</Box>
      </Box>
    </Box>
    <Box as="tbody">
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
    </Box>
  </Box>
);

const WorkersTableRow = ({ worker, deliveredBy, pickWorker }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      as="tr"
      cursor="pointer"
      bg={deliveredBy === worker.name || isHovering ?'green.200' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => pickWorker(worker)}
    >
      <Box as="td" p={2}>{worker.name}</Box>
    </Box>
  );
};

const WorkersTable = ({ workers, deliveredBy, pickWorker }) => (
  <Box as="table">
    <Box as="thead">
      <Box as="tr">
        <Box
          as="th"
          pl={2}
          pr={2}
          textAlign="left"
        >
          Nome
        </Box>
      </Box>
    </Box>
    <Box as="tbody">
      {workers.map((worker) => (
        <WorkersTableRow
          worker={worker}
          deliveredBy={deliveredBy}
          pickWorker={pickWorker}
        />
      ))}
    </Box>
  </Box>
);

const SideNav = (props) => (
  <Box
    pos="fixed"
    w={['100%', '400px']}
    h="100%"
    bg="white"
    zIndex={['1500', '1']}
    ml={['-100%', '0']}
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
      <>
        <Box h="70%" overflowY="scroll">
          <Box p={1}>
            <SearchBox onSearch={props.onSearchHandle} />
          </Box>
          <ProductTable {...props} />
        </Box>

        <Box
          h="30%"
          mt={4}
          overflowY="scroll"
          borderTop="1px"
          borderColor="gray.200"
        >
          <WorkersTable
            workers={props.workers}
            deliveredBy={props.deliveredBy}
            pickWorker={props.pickWorker}
          />
        </Box>
      </>
    )}
  </Box>
);

const OrderMakerFooter = ({ order, applyDiscount, onSubmitOrder }) => (
  <Flex
    as="footer"
    justifyContent="space-between"
    alignItems="center"
    borderTop="1px"
    borderColor="gray.200"
    h="10vh"
    p={2}
  >
    <NumberInput
      min={0}
      max={100}
      onChange={applyDiscount}
      isDisabled={order.items.length === 0}
    >
      <NumberInputField placeholder="Desconto" />
    </NumberInput>
    <Box as="span">Entregador: {order.deliveredBy}</Box>
    <Button
      colorScheme="blue"
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
          items: [...order.items, item],
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
      fetch('/api/products?nPerPage=30')
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
      history.push(`/clients/${client}/orders`);
    });
  };

  useEffect(() => {
    setIsFetching(true);
    Promise.all([
      fetch('/api/products?nPerPage=30').then(res => res.json()),
      fetch('/api/workers').then(res => res.json()),
    ]).then(([ products, workers ]) => {
      products.products = products.products.map((product) => {
        product.qty = product.stock;
        return product;
      });
      setProducts(products.products);
      setWorkers(workers);
      setIsFetching(false);
    });
  }, []);

  return (
    <Box>
      <SideNav
        products={products}
        workers={workers}
        items={order.items}
        deliveredBy={order.deliveredBy}
        pickItem={pickItem}
        pickWorker={pickWorker}
        onSearchHandle={onSearchHandle}
        isFetching={isFetching}
      />

      <Box ml={['0', '400px']} h="100vh">
        <Flex
          as="header"
          h="10vh"
          p="4"
          justifyContent="space-between"
          fontWeight="semibold"
          fontSize="1.2rem"
          bg="blue.400"
          color="white"
        >
          <Box as="span">Pedido para {client}</Box>
          <Box as="span">Items: {order.items.length}</Box>
          <Box as="span">Total: R$ {order.total.toFixed(2)}</Box>
        </Flex>

        <Box as="main" h="80vh" p="4" overflowY="auto">
          {order.items.length === 0 ? (
            <Flex
              mt={5}
              h="100%"
              fontSize="1.5rem"
              justifyContent="center"
              alignItems="center"
            >
              Nenhum Item
            </Flex>
          ) : (
            <ItemsTable
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
    </Box>
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