import React, { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FloatingButton, OrdersTable } from '../components';
import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  Select,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/core';

const DebtsTableRow = ({ debt, client, changeDebtState }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      as="tr"
      bg={debt.state === 'Pago' ? 'green.200' : isHovering ? 'gray.100' : ''}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Box as="td" textAlign="left">R$ {debt.value.toFixed(2)}</Box>
      <Box as="td" textAlign="center">
        <Link to={`/clients/${client.name}/debts/${debt._id}/items`}>
          {debt.itemsCount}
        </Link>
      </Box>
      <Box as="td" textAlign="center">R$ {debt.paid.toFixed(2)}</Box>
      <Box as="td" textAlign="center">
        <Select onChange={(event) => changeDebtState(debt, event.currentTarget.value)}>
          {['Registado', 'Pago'].map((debtState) => (
            <Box
              as="option"
              value={debtState}
              selected={debtState === debt.state}
            >
              {debtState}
            </Box>
          ))}
        </Select>
      </Box>
      <Box as="td" textAlign="center">{getDate(debt.createdAt)}</Box>
    </Box>
  );
};

const DebtsTable = ({ debts, client, changeDebtState }) => (
  <Box as="table">
    <Box as="thead">
      <Box as="tr">
        <Box as="th" textAlign="left">Valor</Box>
        <Box as="th" textAlign="center">Items</Box>
        <Box as="th" textAlign="center">Descontado</Box>
        <Box as="th" textAlign="center">Estado</Box>
        <Box as="th" textAlign="center">Data</Box>
      </Box>
    </Box>
    <Box as="tbody">
      {debts.map((debt) => (
        <DebtsTableRow
          debt={debt}
          client={client}
          changeDebtState={changeDebtState}
        />
      ))}
    </Box>
  </Box>
);

export default function ClientPage(props) {
  const [client, setClient] = useState({});
  const [orders, setOrders] = useState([]);
  const [debts, setDebts] = useState([]);
  const [tabIndex] = useState(props.match.params.tab === 'debts' ? 1 : 0);
  const [isFetching, setIsFetching] = useState(false);
  const history = useHistory();

  const changeDebtState = (debt, debtState) => {
    fetch(`/api/clients/${client.name}/debts/${debt._id}/state`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: debtState })
    }).then(_res => {
      const map = (d) => {
        if (d._id === debt._id) d.state = debtState;
        return d;
      }
      setDebts(debts.map(map));
    });
  };

  const onChangeHandle = (tabIndex) => {
    if (tabIndex === 0) return history.push(`/clients/${client.name}/orders`);
    history.push(`/clients/${client.name}/debts`);
  };

  useEffect(() => {
    const { client } = props.match.params;
    setIsFetching(true);
    Promise.all([
      fetch(`/api/clients/${client}`).then(res => res.json()),
      fetch(`/api/clients/${client}/orders`).then(res => res.json()),
      fetch(`/api/clients/${client}/debts`).then(res => res.json())
    ]).then(([client, orders, debts]) => {
      setClient(client);
      setOrders(orders.orders);
      setDebts(debts);
      setIsFetching(false);
    });
  }, []);

  return (
    <Box>
      <Box as="header" bg="blue.400" p={4}>
        <Box
          as="span"
          fontSize="2rem"
          color="white"
          fontWeight="semibold"
        >
          Cliente {client.name}
        </Box>
      </Box>

      <Box p={4}>
        {isFetching ? ( <Center><Spinner /></Center> ) : (
          <Tabs
            defaultIndex={tabIndex}
            variant="soft-rounded"
            isFitted
            onChange={onChangeHandle}
          >
            <TabList>
              <Tab>Pedidos</Tab>
              <Tab>Debitos</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0} pt={3}>
                {orders.length === 0 ? (
                  <Center textAlign="center" p={5}>Nenhum Pedido</Center>
                ) : (
                  <OrdersTable orders={orders} setOrders={setOrders}/>
                )}
                <FloatingButton onClick={() => history.push(`/clients/${client.name}/orders/add`)}>
                  <AddIcon color="white" />
                </FloatingButton>
              </TabPanel>

              <TabPanel p={0} pt={3}>
                {debts.length === 0 ? (
                  <Center textAlign="center" p={5}>Nenhum Debito</Center>
                ) : (
                  <DebtsTable
                    debts={debts}
                    client={client}
                    changeDebtState={changeDebtState}
                  />
                )}
                <FloatingButton
                  color="red.400"
                  onClick={() => history.push(`/clients/${client.name}/debts/add`)}
                >
                  <AddIcon color="white" />
                </FloatingButton>
              </TabPanel> 
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </Box>
  );
};

function getDate(dateValue) {
  const date = new Date(dateValue);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ás ${date.toLocaleTimeString()}`;
}