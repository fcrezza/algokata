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
  Flex
} from "@chakra-ui/react";
import NextLink from "next/link";
import Head from "next/head";
import nookies from "nookies";
import admin from "utils/firebase-admin";

import {Umrella} from "components/Illustrations";
import Navigation from "components/Navigation";

const classes = [
  {
    id: 1,
    title: "Dasar Pemrograman",
    author: "Peter Schweneiger",
    avatar:
      "https://images.unsplash.com/photo-1456327102063-fb5054efe647?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80"
  },
  {
    id: 2,
    title: "Struktur Data dan Algoritma Dasar",
    author: "Emily Nadicova",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=750&q=80"
  },
  {
    id: 3,
    title: "Pemrograman Berorientasi Objek",
    author: "David Mcmanaman",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=334&q=80"
  }
];

export default function Home({user}) {
  const {fullname, email, avatar, role} = user;

  return (
    <>
      <Navigation
        userFullname={fullname}
        userEmail={email}
        userAvatar={avatar}
        userRole={role}
      />
      <Container padding="6" maxWidth="full">
        <Head>
          <title>Home - Algokata</title>
        </Head>
        <Wrap spacing="6">
          {classes.length > 0 ? (
            classes.map(({id, author, title, avatar}) => (
              <LinkBox
                key={id}
                _hover={{
                  boxShadow: "xl"
                }}
              >
                <NextLink href="#" passHref>
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
                      <Heading
                        color="white"
                        fontSize="2xl"
                        marginBottom="2"
                        isTruncated
                      >
                        {title}
                      </Heading>
                      <Text color="whiteAlpha.800">{author}</Text>
                      <Avatar
                        position="absolute"
                        right="8%"
                        bottom="8%"
                        size="md"
                        loading="lazy"
                        name={author}
                        src={avatar}
                      />
                    </Box>
                  </LinkOverlay>
                </NextLink>
              </LinkBox>
            ))
          ) : (
            <Empty />
          )}
        </Wrap>
      </Container>
    </>
  );
}

function Empty() {
  return (
    <Flex
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      flexDirection="column"
      alignItems="center"
    >
      <Umrella width="200" />
      <Text marginTop="6" color="gray.600" textTransform="capitalize">
        Kamu tidak bergabung kelas apapun :)
      </Text>
    </Flex>
  );
}

export async function getServerSideProps(ctx) {
  try {
    const cookies = nookies.get(ctx);
    const {user_id} = await admin.auth().verifyIdToken(cookies.token);
    let user = await admin.firestore().collection("users").doc(user_id).get();
    user = user.data();

    if (user.role === null) {
      return {
        redirect: {
          permanent: false,
          destination: "/auth"
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
