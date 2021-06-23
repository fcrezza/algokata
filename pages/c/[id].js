import React from "react";
import useSWR, {mutate} from "swr";
import {useRouter} from "next/router";
import {
  Flex,
  Container,
  Heading,
  Text,
  Box,
  Button,
  List,
  ListIcon,
  ListItem,
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
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
  Portal,
  CloseButton,
  Textarea,
  useToast
} from "@chakra-ui/react";
import {BiTask, BiInfoCircle, BiTrash, BiChevronDown} from "react-icons/bi";

import {NotFound as NotFoundIllustration} from "components/Illustrations";
import Head from "components/Head";
import {Loader} from "components/Loader";
import {withProtectedRoute} from "utils/routes";
import axios from "axios";

const MODAL_TYPE = {
  NONE: 0,
  SETTINGS: 1,
  TASK: 2,
  ANNOUNCEMENT: 3
};

function ClassPage() {
  const router = useRouter();
  const {data: cls, error, mutate} = useSWR(`/api/classes/${router.query.id}`);
  const [modal, setModal] = React.useState(MODAL_TYPE.NONE);

  const onClose = () => {
    setModal(MODAL_TYPE.NONE);
  };

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="960px"
    >
      <Head title={cls ? `Kelas - ${cls.name}` : "404 Kelas Tidak ditemukan"} />
      {!cls && error ? (
        <Box alignSelf="center" marginX="auto" textAlign="center">
          <Text>Upsss, Gagal memuat data</Text>
          <Button
            marginTop="4"
            variant="ghost"
            colorScheme="green"
            onClick={() => mutate(null)}
          >
            Coba lagi
          </Button>
        </Box>
      ) : null}
      {cls && Object.keys(cls).length > 0 ? (
        <React.Fragment>
          <EditClassModal
            isOpen={modal === MODAL_TYPE.SETTINGS}
            onClose={onClose}
            defaultName={cls.name}
            defaultDescription={cls.description}
          />
          <CreateTaskModal
            isOpen={modal === MODAL_TYPE.TASK}
            onClose={onClose}
          />
          <AnnouncementCreator
            isOpen={modal === MODAL_TYPE.ANNOUNCEMENT}
            onClose={onClose}
          />
          <Box
            padding="6"
            height="250px"
            borderRadius="lg"
            backgroundColor="green.600"
            backgroundImage="/assets/images/Coding_Isometric.svg"
            backgroundRepeat="no-repeat"
            backgroundPosition="110% 50px"
            backgroundSize="contain"
          >
            <Heading marginBottom="3" as="h1" fontSize="3xl" color="white">
              {cls.name}
            </Heading>
            <Text color="whiteAlpha.800" fontSize="lg">
              {cls.description}
            </Text>
            <Button
              backgroundColor="green.700"
              marginTop="4"
              color="white"
              _hover={{
                backgroundColor: "green.700"
              }}
              _active={{
                backgroundColor: "green.800"
              }}
              onClick={() => setModal(MODAL_TYPE.SETTINGS)}
            >
              Pengaturan
            </Button>
          </Box>
          <Flex justifyContent="space-between" marginTop="8">
            <Text fontWeight="bold" color="gray.800" fontSize="3xl">
              Aktifitas
            </Text>
            <Menu isLazy>
              <MenuButton as={Button} rightIcon={<BiChevronDown size="18" />}>
                Buat
              </MenuButton>
              <Portal>
                <MenuList>
                  <MenuItem onClick={() => setModal(MODAL_TYPE.TASK)}>
                    Buat Tugas
                  </MenuItem>
                  <MenuItem onClick={() => setModal(MODAL_TYPE.ANNOUNCEMENT)}>
                    Buat Pengumuman
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Flex>
          <Box
            marginTop="8"
            padding="6"
            borderRadius="lg"
            borderColor="gray.300"
            borderWidth="1px"
            borderStyle="solid"
          >
            <Heading
              as="h3"
              color="green.600"
              fontWeight="medium"
              fontSize="2xl"
            >
              Mulai interaksi dengan murid di kelas anda
            </Heading>
            <List marginTop="6" spacing="3">
              <ListItem color="gray.600">
                <ListIcon as={BiInfoCircle} fontSize="20px" />
                Buat pengumuman untuk memberitahu info penting
              </ListItem>
              <ListItem color="gray.600">
                <ListIcon as={BiTask} fontSize="20px" />
                Buat tugas untuk murid anda
              </ListItem>
            </List>
          </Box>
        </React.Fragment>
      ) : null}
      {cls && Object.keys(cls).length === 0 ? <NotFound /> : null}
      {!cls && !error ? <Loader /> : null}
    </Container>
  );
}

function NotFound() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      marginX="auto"
      alignSelf="center"
    >
      <NotFoundIllustration width="200" />
      <Text marginTop="6" color="gray.600" textAlign="center">
        Kelas tidak ditemukan
      </Text>
    </Flex>
  );
}

function EditClassModal({isOpen, onClose, defaultName, defaultDescription}) {
  const [className, setClassName] = React.useState(() => defaultName);
  const [classDescription, setClassDescription] = React.useState(
    () => defaultDescription
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const router = useRouter();

  const isSame =
    className === defaultName && classDescription === defaultDescription;

  const closeModal = () => {
    setError(null);
    setClassName(defaultName);
    setClassDescription(defaultDescription);
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const url = `/api/classes/${router.query.id}`;
      setIsSubmitting(true);
      setError(null);
      await axios.put(url, {
        className,
        classDescription
      });
      await mutate(url);
      setIsSubmitting(false);
      closeModal();
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
            onClick={handleSubmit}
          >
            Simpan perubahan
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function CreateTaskModal({isOpen, onClose}) {
  const [taskName, setTitle] = React.useState("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const router = useRouter();

  const closeModal = () => {
    setError(null);
    setTitle("");
    setTaskDescription("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await axios.post(`/api/classes/${router.query.id}/tasks`, {
        taskName,
        taskDescription
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

function AnnouncementCreator({isOpen, onClose}) {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const toast = useToast();

  const closeModal = () => {
    setTitle("");
    setMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await axios.post(`/api/classes/${router.query.id}/announcements`, {
        title,
        message
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
            <Button colorScheme="green" onClick={handleSubmit}>
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

export default withProtectedRoute(ClassPage);
