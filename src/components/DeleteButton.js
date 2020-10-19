import React, { useRef, useState } from 'react';
import { Button } from '@chakra-ui/button';
import { DeleteIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay
} from '@chakra-ui/modal';

export default function DeleteButton({ onDelete, header, body }) {
  const [isOpen, setIsOpen] = useState();
  const cancelRef = useRef();

  const onClickHandle = () => {
    onDelete();
    setIsOpen(false);
  };

  return (
    <>
      <DeleteIcon
        color="red.400"
        cursor="pointer"
        onClick={() => setIsOpen(true)}
      />

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>

            <AlertDialogHeader>
              {header ? header : 'Deletar'}
            </AlertDialogHeader>

            <AlertDialogBody>
              {body ? body : 'Você tem certeza que você quer deletar ?'}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsOpen(false)}
                colorScheme="red"
              >
                Cancelar
              </Button>
              <Button
                ref={cancelRef}
                onClick={onClickHandle}
                ml={3}
              >
                Deletar
              </Button>
            </AlertDialogFooter>

          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};