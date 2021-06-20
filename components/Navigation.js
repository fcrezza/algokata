import React from "react";
import NextLink from "next/link";
import {useRouter} from "next/router";
import {
  Avatar,
  Container,
  Divider,
  Flex,
  IconButton,
  Link,
  LinkBox,
  LinkOverlay,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Portal,
  Button,
  Box,
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
  FormErrorMessage
} from "@chakra-ui/react";
import {MdAdd} from "react-icons/md";
import nookies from "nookies";
import firebase from "utils/firebase-client";

import {Logo} from "components/Icons";

const MODAL_TYPE = {
  CLOSE: 0,
  CREATE_CLASS: 1,
  JOIN_CLASS: 2
};

export default function Navigation({userFullname, userAvatar, userEmail}) {
  const router = useRouter();
  const isLandingPage = router.pathname === "/";
  const isAuthPage = router.pathname === "/auth";

  return (
    <Container padding="0" maxWidth={isLandingPage ? "container.lg" : "full"}>
      <Flex
        paddingX={isLandingPage ? "4" : "6"}
        paddingY="4"
        justifyContent="space-between"
      >
        <LinkBox>
          <NextLink
            href={!isLandingPage && !isAuthPage ? "/home" : "/"}
            passHref
          >
            <LinkOverlay>
              <Flex alignItems="center">
                <Logo width="35" height="35" />
                <Text
                  textDecoration="none"
                  marginLeft="2"
                  fontWeight="bold"
                  fontSize="xl"
                  fontFamily="mono"
                >
                  algokata
                </Text>
              </Flex>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
        {!isLandingPage && !isAuthPage ? (
          <Flex alignItems="center">
            <ClassOptions />
            <AccountOptions
              userAvatar={userAvatar}
              userEmail={userEmail}
              userFullname={userFullname}
            />
          </Flex>
        ) : isLandingPage ? (
          <Flex alignItems="center">
            <Link href="#" marginRight="12">
              Fitur
            </Link>
            <Link href="#">FAQ</Link>
          </Flex>
        ) : null}
      </Flex>
      {!isLandingPage && !isAuthPage ? <Divider /> : null}
    </Container>
  );
}

function CreateClassModal({isOpen, onClose}) {
  const [className, setClassName] = React.useState("");
  const [classDescription, setClassDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setError({message: "Upss, ada yang salah"});
    }, 3000);
  };

  const closeModal = () => {
    setError(null);
    setClassName("");
    setClassDescription("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isSubmitting ? closeModal : () => {}}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Buat Kelas</ModalHeader>
        <ModalCloseButton borderRadius="50%" isDisabled={isSubmitting} />
        <ModalBody>
          <FormControl id="class-name" isRequired>
            <FormLabel>Nama Kelas</FormLabel>
            <Input
              onChange={e => setClassName(e.target.value.trim())}
              value={className}
            />
          </FormControl>
          <FormControl id="class-description" marginTop="6">
            <FormLabel>Deskripsi Kelas (optional)</FormLabel>
            <Input
              onChange={e => setClassDescription(e.target.value.trim())}
              value={classDescription}
            />
          </FormControl>
          <Text color="red.500" fontSize="sm" marginTop="2">
            {error?.message}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            isDisabled={className.length === 0 || isSubmitting}
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

function JoinClassModal({isOpen, onClose}) {
  const [classCode, setClassCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      setIsSubmitting(false);
      setError({message: "Kelas tidak ditemukan"});
    }, 3000);
  };

  const closeModal = () => {
    setError(null);
    setClassCode("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={!isSubmitting ? closeModal : () => {}}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bergabung Ke Kelas</ModalHeader>
        <ModalCloseButton borderRadius="50%" isDisabled={isSubmitting} />
        <ModalBody>
          <Text color="gray.600" marginBottom="4">
            Mintalah kode kelas kepada pengajar, lalu masukkan kode di sini.
          </Text>
          <FormControl isInvalid={error}>
            <Input
              focusBorderColor="green.600"
              placeholder="Kode Kelas"
              onChange={e => setClassCode(e.target.value.trim())}
              value={classCode}
            />
            <FormErrorMessage>{error?.message}</FormErrorMessage>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            isDisabled={classCode.length === 0 || isSubmitting}
            onClick={handleSubmit}
            isFullWidth
          >
            Bergabung
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ClassOptions() {
  const [modal, setModal] = React.useState(MODAL_TYPE.CLOSE);
  const closeModal = () => setModal(MODAL_TYPE.CLOSE);

  return (
    <>
      <CreateClassModal
        isOpen={modal === MODAL_TYPE.CREATE_CLASS}
        onClose={closeModal}
      />
      <JoinClassModal
        isOpen={modal === MODAL_TYPE.JOIN_CLASS}
        onClose={closeModal}
      />
      <Popover placement="bottom-end" isLazy>
        <PopoverTrigger>
          <IconButton
            aria-label="opsi kelas"
            variant="ghost"
            size="md"
            color="gray.800"
            marginRight="6"
            icon={<MdAdd size="24" />}
            isRound
          />
        </PopoverTrigger>
        <Portal>
          <PopoverContent width="200px">
            <PopoverArrow />
            <PopoverBody>
              <Button
                onClick={() => setModal(MODAL_TYPE.CREATE_CLASS)}
                variant="ghost"
                isFullWidth
              >
                Buat Kelas
              </Button>
              <Divider marginY="1" />
              <Button
                onClick={() => setModal(MODAL_TYPE.JOIN_CLASS)}
                variant="ghost"
                isFullWidth
              >
                Gabung Kelas
              </Button>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover>
    </>
  );
}

function AccountOptions({userEmail, userFullname, userAvatar}) {
  const router = useRouter();

  const handleLogout = async () => {
    await firebase.auth().signOut();
    nookies.destroy(null, "token");
    router.push("/");
  };

  return (
    <Popover placement="bottom-end" isLazy>
      <PopoverTrigger>
        <IconButton
          aria-label="opsi akun"
          variant="ghost"
          icon={
            <Avatar
              size="sm"
              loading="eager"
              name={userFullname}
              src={userAvatar}
            />
          }
          isRound
        />
      </PopoverTrigger>
      <Portal>
        <PopoverContent width="300px">
          <PopoverArrow />
          <PopoverBody>
            <Flex alignItems="center" paddingY="2">
              <Avatar
                size="lg"
                loading="eager"
                name={userFullname}
                src={userAvatar}
                marginRight="4"
              />
              <Box>
                <Text
                  color="gray.800"
                  fontSize="md"
                  fontWeight="600"
                  marginBottom="1"
                >
                  {userFullname}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  {userEmail}
                </Text>
              </Box>
            </Flex>
            <Divider marginTop="3" marginBottom="4" />
            <Button onClick={handleLogout} variant="outline" isFullWidth>
              Keluar
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
