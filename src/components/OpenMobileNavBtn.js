import React from 'react';
import { Box } from '@chakra-ui/core';
import { HamburgerIcon } from '@chakra-ui/icons';
import { useSideNav } from '../contexts/SideNavContext';


export default function OpenMobileNavBtn({ }) {
  const { setIsOpen } = useSideNav();

  const onClickHandle = () => {
    document.body.style.overflowY = "hidden";
    setIsOpen(true);
  };

  return (
    <Box
      as="button"
      display={["inline-block", "none"]}
      onClick={onClickHandle}
    >
      <HamburgerIcon fontSize="1.5rem" color="white" />
    </Box>
  );
};