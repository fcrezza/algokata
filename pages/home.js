import React from "react";
import {
  Container,
  Box,
  Heading,
  Text,
  Avatar,
  Wrap,
  LinkOverlay,
  LinkBox,
  Flex,
  Spinner
} from "@chakra-ui/react";
import NextLink from "next/link";
import Head from "next/head";
import nookies from "nookies";
import admin from "utils/firebase-admin";

import {Umrella} from "components/Illustrations";
import Navigation from "components/Navigation";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

export default function Home({user, clss}) {
  const {fullname, email, avatar, role} = user;

  return (
    <Flex flexDirection="column" width="100%" minHeight="100vh">
      <Navigation
        userFullname={fullname}
        userEmail={email}
        userAvatar={avatar}
        userRole={role}
      />
      <Container padding="6" display="flex" flex="1" maxWidth="full">
        <Head>
          <title>Home - Algokata</title>
        </Head>
        {clss?.length > 0 ? (
          <Wrap spacing="6">
            {clss.map(({id, teacher, name}) => (
              <ClassItem
                key={id}
                id={id}
                name={name}
                teacherFullname={teacher.fullname}
                teacherAvatar={teacher.avatar}
              />
            ))}
          </Wrap>
        ) : clss?.length === 0 ? (
          <EmptyState userRole={role} />
        ) : (
          <LoadingSpinner />
        )}
      </Container>
    </Flex>
  );
}

function ClassItem({id, name, teacherFullname, teacherAvatar}) {
  return (
    <LinkBox
      _hover={{
        boxShadow: "xl"
      }}
    >
      <NextLink href={`/c/${id}`} passHref>
        <LinkOverlay>
          <Box
            width="300px"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
            padding="4"
            height="180px"
            backgroundColor="green.600"
            backgroundImage="assets/images/waves.svg"
            backgroundRepeat="no-repeat"
            backgroundPosition="right bottom"
            backgroundSize="contain"
          >
            <Heading color="white" fontSize="2xl" marginBottom="2" isTruncated>
              {name}
            </Heading>
            <Text color="whiteAlpha.800">{teacherFullname}</Text>
            <Avatar
              position="absolute"
              right="8%"
              bottom="8%"
              size="md"
              loading="lazy"
              name={teacherFullname}
              src={teacherAvatar}
            />
          </Box>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
}

function EmptyState({userRole}) {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      marginX="auto"
      alignSelf="center"
    >
      <Umrella width="200" />
      <Text marginTop="6" color="gray.600" textAlign="center">
        {userRole === "student"
          ? "Kamu tidak bergabung dengan kelas apapun :)"
          : "Kamu tidak mengajar kelas apapun :)"}
      </Text>
    </Flex>
  );
}

function LoadingSpinner() {
  return (
    <Box alignSelf="center" marginX="auto">
      <Spinner
        color="green.600"
        emptyColor="gray.200"
        size="lg"
        speed="0.85s"
        thickness="4px"
        label="Loading"
      />
    </Box>
  );
}

export async function getServerSideProps(ctx) {
  try {
    const {idToken, refreshToken} = nookies.get(ctx);
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

    if (newIdToken !== null) {
      sendCookie(ctx, "idToken", newIdToken);
    }

    let clss = (await userRef.collection("classes").get()).docs;
    clss = clss.map(c => c.data());

    return {
      props: {
        clss,
        user: userData
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
