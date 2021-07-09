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
  FormErrorMessage,
  useDisclosure,
  useToast
} from "@chakra-ui/react";
import {MdAdd} from "react-icons/md";

import {Logo} from "components/Icons";
import axios from "utils/axios";
import {useAuth} from "utils/auth";

export default function Navigation() {
  const {user} = useAuth();
  const router = useRouter();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const isLandingPage = router.pathname === "/";
  const isAuthPage = router.pathname === "/auth";
  const isInClass =
    router.pathname.startsWith("/c/") ||
    router.pathname.startsWith("/d/") ||
    router.pathname.startsWith("/m/") ||
    router.pathname.startsWith("/tc/");

  return (
    <Container padding="0" maxWidth={isLandingPage ? "container.lg" : "full"}>
      {user.role === "student" ? (
        <JoinClassModal isOpen={isOpen} onClose={onClose} />
      ) : (
        <CreateClassModal isOpen={isOpen} onClose={onClose} />
      )}
      <Flex paddingX={isLandingPage ? "4" : "6"} justifyContent="space-between">
        <LinkBox>
          <NextLink
            href={!isLandingPage && !isAuthPage ? "/home" : "/"}
            passHref
          >
            <LinkOverlay>
              <Flex paddingY="4" alignItems="center">
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
        {isInClass ? (
          <Flex marginX="auto">
            <ClassLink
              href={`/c/${router.query.cid}`}
              isActive={router.pathname === "/c/[cid]"}
            >
              Linimasa
            </ClassLink>
            {user.role === "teacher" ? (
              <ClassLink
                href={`/tc/${router.query.cid}`}
                isActive={router.pathname === "/tc/[cid]"}
              >
                Untuk Diperiksa
              </ClassLink>
            ) : null}
            <ClassLink
              href={`/d/${router.query.cid}`}
              isActive={router.pathname === "/d/[cid]"}
            >
              Diskusi
            </ClassLink>
            <ClassLink
              href={`/m/${router.query.cid}`}
              isActive={router.pathname === "/m/[cid]"}
            >
              Anggota
            </ClassLink>
          </Flex>
        ) : null}
        {!isLandingPage && !isAuthPage ? (
          <Flex alignItems="center">
            <IconButton
              aria-label={
                user.role === "student" ? "Bergabung ke kelas" : "Buat Kelas"
              }
              variant="ghost"
              size="md"
              color="gray.800"
              marginRight="6"
              icon={<MdAdd size="24" />}
              onClick={onOpen}
              isRound
            />
            <AccountOptions
              userAvatar={user.avatar}
              userEmail={user.email}
              userFullname={user.fullname}
              userRole={user.role}
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

function ClassLink({children, href, isActive}) {
  return (
    <LinkBox
      _hover={{
        backgroundColor: !isActive ? "gray.50" : null
      }}
      backgroundColor={isActive ? "green.50" : null}
    >
      <NextLink href={href} passHref>
        <LinkOverlay>
          <Flex
            color={isActive ? "green.600" : "gray.600"}
            fontWeight="medium"
            justifyContent="center"
            alignItems="center"
            height="100%"
            paddingX="5"
          >
            {children}
          </Flex>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
}

function CreateClassModal({isOpen, onClose}) {
  const [className, setClassName] = React.useState("");
  const [classDescription, setClassDescription] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const {data: cls} = await axios.post("/api/classes", {
        className,
        classDescription
      });
      setIsSubmitting(false);
      onClose();
      router.push(`/c/${cls.id}`);
    } catch (error) {
      setIsSubmitting(false);
      setError({message: "Upss, gagal membuat kelas"});
    }
  };

  const closeModal = () => {
    setError(null);
    setClassName("");
    setClassDescription("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={!isSubmitting ? closeModal : () => {}}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Buat Kelas</ModalHeader>
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
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      const {data: cls} = await axios.get(`/api/classes/${classCode}/join`);
      setIsSubmitting(false);
      onClose();
      router.push(`/c/${cls.id}`);
    } catch (error) {
      setIsSubmitting(false);
      if (error.response) {
        setError(error.response.data.error);
      } else {
        setError({message: "Upss, gagal melakukan operasi"});
      }
    }
  };

  const closeModal = () => {
    setError(null);
    setClassCode("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={!isSubmitting ? closeModal : () => {}}>
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

function AccountOptions({userEmail, userFullname, userAvatar}) {
  const {logout} = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [isClicked, setClickState] = React.useState(false);

  const handleLogout = async () => {
    try {
      setClickState(true);
      await logout();
      setClickState(false);
      router.push("/");
    } catch (error) {
      setClickState(false);
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
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
            <Button
              onClick={handleLogout}
              variant="outline"
              isDisabled={isClicked}
              isFullWidth
            >
              Keluar
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}
