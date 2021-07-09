import * as React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Text,
  Button,
  useToast
} from "@chakra-ui/react";

export default function EditTaskModal(props) {
  const {isOpen, onClose, defaultTitle, defaultDescription, handleEditTask} =
    props;
  const [title, setTitle] = React.useState(() => defaultTitle);
  const [description, setDescription] = React.useState(
    () => defaultDescription
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toast = useToast();
  const isSame = title === defaultTitle && description === defaultDescription;

  const closeModal = (
    name = defaultTitle,
    description = defaultDescription
  ) => {
    setError(null);
    setTitle(name);
    setDescription(description);
    onClose();
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newTaskData = await handleEditTask(title, description);
      setIsSubmitting(false);
      toast({
        status: "success",
        title: "Perubahan berhasil disimpan",
        isClosable: true
      });
      closeModal(newTaskData.title, newTaskData.description);
    } catch (error) {
      setIsSubmitting(false);
      setError({message: "Upss, gagal menyimpan perubahan"});
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={!isSubmitting ? closeModal : () => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Kelas</ModalHeader>
        <ModalCloseButton borderRadius="50%" isDisabled={isSubmitting} />
        <ModalBody>
          <FormControl id="class-name" isRequired>
            <FormLabel>Nama Kelas</FormLabel>
            <Input onChange={e => setTitle(e.target.value)} value={title} />
          </FormControl>
          <FormControl id="class-description" marginTop="6">
            <FormLabel>Deskripsi Kelas (optional)</FormLabel>
            <Input
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
            isDisabled={title.length === 0 || isSubmitting || isSame}
            onClick={onSubmit}
          >
            Simpan perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
