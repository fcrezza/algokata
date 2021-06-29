import * as React from "react";
import {BiTrash} from "react-icons/bi";
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
  IconButton,
  Tooltip,
  Text,
  Button
} from "@chakra-ui/react";

export default function EditClassModal(props) {
  const {isOpen, onClose, defaultName, defaultDescription, handleSubmit} =
    props;
  const [className, setClassName] = React.useState(defaultName);
  const [classDescription, setClassDescription] =
    React.useState(defaultDescription);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const isSame =
    className === defaultName && classDescription === defaultDescription;

  const closeModal = (name = defaultName, description = defaultDescription) => {
    setError(null);
    setClassName(name);
    setClassDescription(description);
    onClose();
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const newClassData = await handleSubmit({
        className,
        classDescription
      });
      setIsSubmitting(false);
      closeModal(newClassData.name, newClassData.description);
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
            <Input
              onChange={e => setClassName(e.target.value)}
              value={className}
            />
          </FormControl>
          <FormControl id="class-description" marginTop="6">
            <FormLabel>Deskripsi Kelas (optional)</FormLabel>
            <Input
              onChange={e => setClassDescription(e.target.value)}
              value={classDescription}
            />
          </FormControl>
          <Text color="red.500" fontSize="sm" marginTop="2">
            {error?.message}
          </Text>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Tooltip label="Hapus kelas" placement="right">
            <IconButton
              aria-label="Hapus kelas"
              colorScheme="red"
              icon={<BiTrash size="18" />}
            />
          </Tooltip>
          <Button
            colorScheme="green"
            isDisabled={className.length === 0 || isSubmitting || isSame}
            onClick={onSubmit}
          >
            Simpan perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
