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

export default function FeedbackModal(props) {
  const {isOpen, onClose, onSubmit, defaultValue, defaultMessage} = props;
  const [value, setValue] = React.useState(defaultValue);
  const [message, setMessage] = React.useState(defaultMessage);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const closeModal = (value = defaultValue, message = defaultMessage) => {
    setError(null);
    setValue(value);
    setMessage(message);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const data = await onSubmit(value, message);
      setIsSubmitting(false);
      closeModal(data.value, data.message);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response) {
        setError(error.response.data.error);
        return;
      }
      setError({message: "Upss, operasi gagal dilakukan"});
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
