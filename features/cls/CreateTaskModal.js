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
  Input
} from "@chakra-ui/react";

export default function CreateTaskModal({isOpen, onClose, handleSubmit}) {
  const [taskName, setTitle] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const closeModal = () => {
    setError(null);
    setTitle("");
    setTaskDescription("");
    onClose();
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await handleSubmit({
        title: taskName,
        description: taskDescription,
        type: "task"
      });
      setIsSubmitting(false);
      closeModal();
    } catch (error) {
      setIsSubmitting(false);
      setError({message: "Upss, gagal membuat tugas"});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={!isSubmitting ? closeModal : () => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Buat Tugas</ModalHeader>
        <ModalCloseButton borderRadius="50%" isDisabled={isSubmitting} />
        <ModalBody>
          <FormControl id="task-name" isRequired>
            <FormLabel>Nama Tugas</FormLabel>
            <Input onChange={e => setTitle(e.target.value)} value={taskName} />
          </FormControl>
          <FormControl id="task-description" marginTop="6">
            <FormLabel>Deskripsi Tugas (optional)</FormLabel>
            <Input
              onChange={e => setTaskDescription(e.target.value)}
              value={taskDescription}
            />
          </FormControl>
          <Text color="red.500" fontSize="sm" marginTop="2">
            {error?.message}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            isDisabled={taskName.length === 0 || isSubmitting}
            onClick={onSubmit}
            isFullWidth
          >
            Buat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
