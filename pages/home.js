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
  Button
} from "@chakra-ui/react";
import NextLink from "next/link";
import Head from "components/Head";

import {Umrella} from "components/Illustrations";
import {useAuth} from "utils/auth";
import useSWR from "swr";
import {Loader} from "components/Loader";
import {withProtectedRoute} from "utils/routes";

function Home() {
  const {user} = useAuth();
  const {data: clss, error, mutate} = useSWR(`/api/users/${user.id}/classes`);

  return (
    <Container padding="6" display="flex" flex="1" maxWidth="full">
      <Head title={`Home - ${user.fullname}`} />
      {!clss && error ? (
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
      ) : null}
      {clss?.length === 0 ? <EmptyState userRole={user.role} /> : null}
      {!clss && !error ? <Loader /> : null}
    </Container>
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
            backgroundImage="/assets/images/waves.svg"
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

export default withProtectedRoute(Home);
