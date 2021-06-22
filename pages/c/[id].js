import React from "react";
import useSWR from "swr";
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
  ListItem
} from "@chakra-ui/react";
import {BiTask, BiInfoCircle} from "react-icons/bi";

import {NotFound as NotFoundIllustration} from "components/Illustrations";
import Head from "components/Head";
import {Loader} from "components/Loader";
import {withProtectedRoute} from "utils/routes";

function ClassPage() {
  const router = useRouter();
  const {data: cls, error, mutate} = useSWR(`/api/classes/${router.query.id}`);
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
          </Box>
          <Flex justifyContent="space-between" marginTop="8">
            <Text fontWeight="bold" color="gray.800" fontSize="3xl">
              Aktifitas
            </Text>
            <Button>Buat +</Button>
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

export default withProtectedRoute(ClassPage);
