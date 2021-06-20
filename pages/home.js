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
import useSWR from "swr";

import {Umrella} from "components/Illustrations";
import Navigation from "components/Navigation";
import axios from "utils/axios";
import {sendCookie, verifyIdentity} from "utils/server-helpers";

// const classes = [
//   {
//     id: 1,
//     title: "Dasar Pemrograman",
//     author: "Peter Schweneiger",
//     avatar:
//       "https://images.unsplash.com/photo-1456327102063-fb5054efe647?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80"
//   },
//   {
//     id: 2,
//     title: "Struktur Data dan Algoritma Dasar",
//     author: "Emily Nadicova",
//     avatar:
//       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80"
//   },
//   {
//     id: 3,
//     title: "Pemrograman Berorientasi Objek",
//     author: "David Mcmanaman",
//     avatar:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=334&q=80"
//   }
// ];

export default function Home({user}) {
  const {fullname, email, avatar, role} = user;
  const {data: classes, error} = useSWR("/api/classes", url =>
    axios.get(url).then(({data}) => data)
  );
  console.log({classes, error});

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
        {classes?.length > 0 ? (
          <Wrap spacing="6">
            {classes.map(({id, author, title, avatar}) => (
              <ClassItem
                key={id}
                id={id}
                name={title}
                teacherFullname={author}
                teacherAvatar={avatar}
              />
            ))}
          </Wrap>
        ) : classes?.length === 0 ? (
          <EmptyState />
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
      <NextLink href={`#${id}`} passHref>
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

function EmptyState() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      marginX="auto"
      alignSelf="center"
    >
      <Umrella width="200" />
      <Text
        marginTop="6"
        color="gray.600"
        textAlign="center"
        textTransform="capitalize"
      >
        Tidak ada kelas :)
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
    let userData = await admin
      .firestore()
      .collection("users")
      .doc(user.user_id)
      .get();
    userData = userData.data();

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

    return {
      props: {
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
