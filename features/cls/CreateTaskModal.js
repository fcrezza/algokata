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
  Input,
  Textarea,
  useToast
} from "@chakra-ui/react";

export default function CreateTaskModal({isOpen, onClose, onCreate}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toast = useToast();

  const closeModal = () => {
    setError(null);
    setTitle("");
    setDescription("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate({
        title,
        description,
        type: "task"
      });
      setIsSubmitting(false);
      closeModal();
      toast({
        status: "success",
        title: "Tugas berhasil dibuat",
        isClosable: true
      });
    } catch (error) {
      if (error.response) {
        setError({message: error.response.data.error.message});
      } else {
        setError({message: "Upss, gagal melakukan operasi"});
      }
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
            <Input onChange={e => setTitle(e.target.value)} value={title} />
          </FormControl>
          <FormControl id="task-description" marginTop="6">
            <FormLabel>Deskripsi Tugas (optional)</FormLabel>
            <Textarea
              onChange={e => setDescription(e.target.value)}
              value={description}
            />
          </FormControl>
          <Text color="red.500" fontSize="sm" marginTop="2">
            {error?.message}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            isDisabled={title.length === 0 || isSubmitting}
            onClick={handleSubmit}
            isFullWidth
          >
            Buat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
