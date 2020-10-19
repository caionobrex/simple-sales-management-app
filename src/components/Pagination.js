import React, { useState } from 'react';
import { Box, Flex } from '@chakra-ui/core';

const PaginationItem = ({ isActivated, index, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <Box
      mr={1}
      p={1}
      pl={3}
      pr={3}
      bg={isActivated || isHovering ? 'teal.500' : ''}
      color={isActivated || isHovering ? 'gray.100' : ''}
      borderRadius="sm"
      cursor="pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => onClick(index)}
    >
      {index}
    </Box>
  );
};

export default function Pagination(props) {
  const list = [];
  for (var i = 0; i < props.nOfPages; i++) list.push(i);
  
  return (
    <Box>
      <Flex flexWrap="wrap" alignItems="center">
        {list.map((_item, index) => (
          <PaginationItem
            isActivated={index + 1 === props.currentPage}
            index={index + 1}
            onClick={(page) => props.onClick(page)}
          />
        ))}
      </Flex>
    </Box>
  );
};