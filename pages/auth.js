import {Button} from "@chakra-ui/button";
import {Box, Container, Heading, Text} from "@chakra-ui/layout";
import axios from "axios";
import Navigation from "components/Navigation";
import NextHead from "next/head";
import {useRouter} from "next/router";
import nookies from "nookies";

import admin from "utils/firebase-admin";

export default function Auth({user}) {
  const router = useRouter();
  const handleClick = async role => {
    try {
      await axios.put("/api/auth", {...user, role});
      router.push("/home");
    } catch (error) {
      console.log("error during authentication", error);
    }
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="lg">
        <NextHead>
          <title>Autentikasi - Algokata</title>
        </NextHead>
        <Box
          marginTop="20"
          borderRadius="xl"
          backgroundColor="white"
          boxShadow="lg"
          padding="8"
        >
          <Heading
            textTransform="capitalize"
            fontSize="3xl"
            marginBottom="8"
            color="gray.800"
          >
            Siapakah anda?
          </Heading>
          <Button
            variant="solid"
            colorScheme="green"
            size="lg"
            marginBottom="4"
            onClick={() => handleClick("teacher")}
            isFullWidth
          >
            Pengajar
          </Button>
          <Button
            variant="outline"
            colorScheme="green"
            size="lg"
            marginBottom="4"
            onClick={() => handleClick("student")}
            isFullWidth
          >
            Siswa
          </Button>
          <Text as="i" marginTop="4" color="gray.600" fontSize="sm">
            Catatan: pilihan ini tidak dapat dirubah
          </Text>
        </Box>
      </Container>
    </>
  );
}

export async function getServerSideProps(ctx) {
  try {
    const cookies = nookies.get(ctx);
    const {user_id} = await admin.auth().verifyIdToken(cookies.token);
    let user = await admin.firestore().collection("users").doc(user_id).get();
    user = user.data();

    if (user.role !== null) {
      return {
        redirect: {
          permanent: false,
          destination: "/home"
        }
      };
    }

    return {
      props: {
        user
      }
    };
  } catch (err) {
    return {
      redirect: {
        permanent: false,
        destination: "/"
      }
    };
  }
}
