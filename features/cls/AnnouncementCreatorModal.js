import React from "react";
import {
  useToast,
  Modal,
  ModalBody,
  ModalContent,
  CloseButton,
  Flex,
  Heading,
  Box,
  Button,
  Textarea,
  FormControl,
  FormLabel,
  Input
} from "@chakra-ui/react";

export default function AnnouncementCreatorModal({
  isOpen,
  onClose,
  handleSubmit
}) {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const toast = useToast();

  const closeModal = () => {
    setTitle("");
    setMessage("");
    onClose();
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      await handleSubmit({
        title,
        message,
        type: "announcement"
      });
      setIsSubmitting(false);
      closeModal();
    } catch (error) {
      setIsSubmitting(false);
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      size="full"
      onClose={!isSubmitting ? closeModal : () => {}}
    >
      <ModalContent margin="0">
        <ModalBody padding="0">
          <Flex
            paddingY="3"
            paddingX="6"
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth="1px"
            borderBottomColor="gray.100"
            borderBottomStyle="solid"
          >
            <Flex alignItems="center">
              <CloseButton borderRadius="50%" onClick={onClose} />
              <Heading marginLeft="4" as="h3" fontSize="xl" color="gray.800">
                Buat Pengumuman
              </Heading>
            </Flex>
            <Button colorScheme="green" onClick={onSubmit}>
              Kirim
            </Button>
          </Flex>
          <Box padding="6">
            <FormControl id="task-name">
              <FormLabel>Judul</FormLabel>
              <Input onChange={e => setTitle(e.target.value)} value={title} />
            </FormControl>
            <FormControl id="task-description" marginTop="6">
              <FormLabel>Pesan</FormLabel>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                resize="vertical"
                size="lg"
              />
            </FormControl>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
