import {Button} from "@chakra-ui/button";
import {Box, Container, Heading, Text} from "@chakra-ui/layout";
import Navigation from "components/Navigation";
import NextHead from "next/head";
import {useRouter} from "next/router";
import nookies from "nookies";

import axios from "utils/axios";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default function Auth() {
  const router = useRouter();
  const handleClick = async role => {
    try {
      await axios.post("/api/auth/role", {role});
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
    const {idToken, refreshToken} = nookies.get(ctx);
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    let userData = await admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .get();
    userData = userData.data();

    if (userData.role !== null) {
      return {
        redirect: {
          permanent: false,
          destination: "/home"
        }
      };
    }

    if (newIdToken !== null) {
      sendCookie(ctx, "idToken", newIdToken);
    }

    return {
      props: {}
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
