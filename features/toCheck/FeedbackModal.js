import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalFooter,
  ModalHeader,
  ModalCloseButton,
  Text,
  ModalBody,
  ModalContent,
  Button,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputStepper
} from "@chakra-ui/react";

export default function FeedbackModal({isOpen, onClose, onSubmit}) {
  const [value, setValue] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const closeModal = () => {
    setError(null);
    setValue(0);
    setMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(value, message);
      setIsSubmitting(false);
      closeModal();
    } catch (error) {
      setIsSubmitting(false);
      if (error.response) {
        setError({message: error.response.data.error.message});
        return;
      }
      setError({message: "Upss, gagal membuat tugas"});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={!isSubmitting ? closeModal : () => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Nilai Jawaban</ModalHeader>
        <ModalCloseButton borderRadius="50%" isDisabled={isSubmitting} />
        <ModalBody>
          <FormControl id="value" isRequired>
            <FormLabel>Nilai</FormLabel>
            <NumberInput
              value={value}
              min={0}
              max={100}
              onChange={val => setValue(Number(val))}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>
          <FormControl id="task-description" marginTop="6">
            <FormLabel>Pesan (optional)</FormLabel>
            <Textarea
              onChange={e => setMessage(e.target.value)}
              value={message}
            />
          </FormControl>
          <Text color="red.500" fontSize="sm" marginTop="2">
            {error?.message}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            isDisabled={value.length === 0 || isSubmitting}
            onClick={handleSubmit}
            isFullWidth
          >
            Kirim
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
