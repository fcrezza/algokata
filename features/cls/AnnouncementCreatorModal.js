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
  Textarea,
  useToast
} from "@chakra-ui/react";

export default function CreateAnnouncementModal(props) {
  const {isOpen, onClose, onCreate} = props;
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const toast = useToast();

  const closeModal = () => {
    setError(null);
    setTitle("");
    setMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await onCreate({title, message, type: "announcement"});
      setIsSubmitting(false);
      closeModal();
      toast({
        status: "success",
        title: "Pengumuman berhasil dibuat",
        isClosable: true
      });
    } catch (error) {
      setIsSubmitting(false);
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
        <ModalHeader>Buat Pengumuman</ModalHeader>
        <ModalCloseButton borderRadius="50%" isDisabled={isSubmitting} />
        <ModalBody>
          <FormControl id="title" isRequired>
            <FormLabel>Judul</FormLabel>
            <Input onChange={e => setTitle(e.target.value)} value={title} />
          </FormControl>
          <FormControl id="message" marginTop="6" isRequired>
            <FormLabel>Pesan</FormLabel>
            <Textarea
              onChange={e => setMessage(e.target.value)}
              value={message}
            />
          </FormControl>
          <Text color="red.500" fontSize="sm" marginTop="2">
            {error?.message}
          </Text>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Button
            colorScheme="green"
            isDisabled={
              title.length === 0 || message.length === 0 || isSubmitting
            }
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
