import {Flex, Container, Heading, Text, Box} from "@chakra-ui/react";
import {NotFound as NotFoundIllustration} from "components/Illustrations";
import Navigation from "components/Navigation";
import Head from "next/head";
import {parseCookies} from "nookies";
import admin from "utils/firebase-admin";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default function ClassPage({user, cls}) {
  const {fullname, email, avatar, role} = user;

  return (
    <Flex flexDirection="column" width="100%" minHeight="100vh">
      <Head>
        {cls ? (
          <title>Kelas - {cls.name}</title>
        ) : (
          <title>404 Kelas Tidak ditemukan</title>
        )}
      </Head>
      <Navigation
        userFullname={fullname}
        userEmail={email}
        userAvatar={avatar}
        userRole={role}
      />
      <Container padding="6" display="flex" flex="1" maxWidth="full">
        {cls ? (
          <Box>
            <Heading marginBottom="2" as="h1" fontSize="3xl" color="gray.800">
              {cls.name}
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Hai {user.fullname}, Kamu adalah{" "}
              {user.id === cls.teacher.id ? "Pengajar" : "Murid"} di kelas ini
            </Text>
          </Box>
        ) : (
          <NotFound />
        )}
      </Container>
    </Flex>
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

export async function getServerSideProps(ctx) {
  try {
    const {id: idClass} = ctx.params;
    const {idToken, refreshToken} = parseCookies(ctx);
    const [user, newIdToken] = await verifyIdentity(idToken, refreshToken);
    const userRef = admin.firestore().collection("users").doc(user.user_id);
    const userData = (await userRef.get()).data();

    if (userData.role === null) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth"
        }
      };
    }

    const cls = await admin
      .firestore()
      .collection("classes")
      .doc(idClass)
      .get();

    if (newIdToken !== null) {
      sendCookie(ctx, "idToken", newIdToken);
    }

    return {
      props: {
        user: userData,
        cls: cls.exists ? cls.data() : null
      }
    };
  } catch (error) {
    console.log(error);
    return {
      redirect: {
        permanent: false,
        destination: "/"
      }
    };
  }
}
