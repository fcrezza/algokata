import * as React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  UnorderedList,
  ListItem,
  Text,
  Button
} from "@chakra-ui/react";

export default function ValidationResultModal({result, onClose, onSave}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  let buttonText = "";
  let modalTitle = "";
  let onClickCallback = onClose;
  const onCloseCallback = isSubmitting ? () => {} : onClose;
  let listItems = [];

  if (result) {
    if (result.stats.failures === 0) {
      buttonText = "Simpan Dan Lanjut Ke Item Berikutnya";
      modalTitle = "Horee, berhasil";
      onClickCallback = async () => {
        setIsSubmitting(true);
        await onSave();
        setIsSubmitting(false);
      };
    } else {
      buttonText = "Kembali";
      modalTitle = "Upzzz, masih ada yang salah";
    }

    listItems = result.result.map(r => {
      const {id, title, state, error, type} = r;

      if (type === "test") {
        const itemColor = state === "passed" ? "green.400" : "red.400";
        let errorMessage = null;

        if (state === "failed") {
          errorMessage = (
            <Text fontSize="sm" color="gray.600">
              Error: {error}
            </Text>
          );
        }

        return (
          <ListItem key={id} color={itemColor}>
            {title}
            {errorMessage}
          </ListItem>
        );
      }
    });
  }

  return (
    <Modal isOpen={result !== null} onClose={onCloseCallback}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton disabled={isSubmitting} />
        <ModalBody>
          <UnorderedList>{listItems}</UnorderedList>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            marginRight={3}
            onClick={onClickCallback}
            disabled={isSubmitting}
            isFullWidth
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
