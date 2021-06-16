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
  Input
} from "@chakra-ui/react";
import {MdAdd} from "react-icons/md";

import {Logo} from "components/Icons";

export default function Navigation() {
  const router = useRouter();
  const [isModalOpen, setModalVisibility] = React.useState(false);
  // TODO: show different style and item when authenticated
  const isLandingPage = router.pathname === "/";
  const isAuthPage = router.pathname === "/auth";

  return (
    <Container padding="0" maxWidth={isLandingPage ? "container.lg" : "full"}>
      <Modal isOpen={isModalOpen} onClose={() => setModalVisibility(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Bergabung Ke Kelas</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text color="gray.600" marginBottom="4">
              Mintalah kode kelas kepada pengajar, lalu masukkan kode di sini.
            </Text>
            <Input placeholder="Kode Kelas" />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" isFullWidth>
              Bergabung
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex
        paddingX={isLandingPage ? "4" : "6"}
        paddingY="4"
        justifyContent="space-between"
      >
        <LinkBox>
          <NextLink href="/" passHref>
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
        {isLandingPage && !isAuthPage ? (
          <Flex alignItems="center">
            <Link href="#" marginRight="12">
              Fitur
            </Link>
            <Link href="#">FAQ</Link>
          </Flex>
        ) : !isAuthPage ? (
          <Flex alignItems="center">
            <IconButton
              aria-label="join a class"
              variant="ghost"
              size="md"
              color="gray.800"
              marginRight="6"
              icon={<MdAdd size="24" />}
              onClick={() => setModalVisibility(true)}
              isRound
            />
            <Popover placement="bottom-end" isLazy>
              <PopoverTrigger>
                <IconButton
                  aria-label="account options"
                  variant="ghost"
                  icon={
                    <Avatar
                      size="sm"
                      loading="eager"
                      name="anang fachreza"
                      src="https://pbs.twimg.com/profile_images/1404532784933216261/LlgKDVoF_400x400.jpg"
                    />
                  }
                  isRound
                />
              </PopoverTrigger>
              <Portal>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverBody>
                    <Flex alignItems="center" paddingY="2">
                      <Avatar
                        size="lg"
                        loading="eager"
                        name="anang fachreza"
                        src="https://pbs.twimg.com/profile_images/1404532784933216261/LlgKDVoF_400x400.jpg"
                        marginRight="4"
                      />
                      <Box>
                        <Text
                          color="gray.800"
                          fontSize="md"
                          fontWeight="600"
                          marginBottom="1"
                        >
                          Anang Fachreza
                        </Text>
                        <Text color="gray.600" fontSize="sm">
                          fachrezanang@gmail.com
                        </Text>
                      </Box>
                    </Flex>
                    <Divider marginTop="3" marginBottom="4" />
                    <Button variant="outline" isFullWidth>
                      Keluar
                    </Button>
                  </PopoverBody>
                </PopoverContent>
              </Portal>
            </Popover>
          </Flex>
        ) : null}
      </Flex>
      {!isLandingPage && !isAuthPage ? <Divider /> : null}
    </Container>
  );
}
