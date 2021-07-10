import * as React from "react";
import useSWR from "swr";
import NextLink from "next/link";
import {
  Container,
  Stack,
  LinkBox,
  LinkOverlay,
  Text,
  Flex,
  Box,
  Heading
} from "@chakra-ui/react";
import {useRouter} from "next/router";

import Head from "components/Head";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";

export default function ToCheck() {
  const router = useRouter();
  const {cid: classId} = router.query;
  const url = `/api/classes/${classId}/activities?type=task&order=desc`;
  const {data: tasks, error, mutate} = useSWR(url);
  const taskList = [];

  if (tasks) {
    tasks.forEach(item => {
      const task = (
        <TaskItem
          key={item.id}
          title={item.title}
          href={`${router.asPath}/${item.id}`}
        />
      );

      taskList.push(task);
    });
  }

  return (
    <Container
      marginTop="8"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="800px"
    >
      <Head title="Untuk diperiksa - Algokata" />
      {(function () {
        if (!tasks && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (tasks && tasks.length > 0) {
          return (
            <Box>
              <Heading
                as="h1"
                textTransform="capitalize"
                color="gray.800"
                fontSize="3xl"
                marginBottom="8"
              >
                Periksa jawaban siswa anda
              </Heading>
              <Stack spacing="4">{taskList}</Stack>
            </Box>
          );
        }

        if (tasks && tasks.length === 0) {
          return (
            <Flex justifyContent="center" alignContent="center">
              <Text color="gray.600">Tidak ada tugas yang perlu diperiksa</Text>
            </Flex>
          );
        }

        if (!tasks && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}

function TaskItem({title, href}) {
  return (
    <LinkBox
      backgroundColor="gray.100"
      borderRadius="lg"
      padding="2"
      _hover={{
        backgroundColor: "gray.200"
      }}
    >
      <NextLink href={href} passHref>
        <LinkOverlay>
          <Text
            color="gray.800"
            textDecoration="none"
            marginLeft="2"
            fontWeight="bold"
            fontSize="lg"
          >
            {title}
          </Text>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
}
