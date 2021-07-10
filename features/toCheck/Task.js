import {useRouter} from "next/router";
import useSWR from "swr";
import NextLink from "next/link";
import {
  Container,
  Stack,
  Flex,
  Text,
  LinkBox,
  LinkOverlay,
  Avatar,
  Box,
  Heading
} from "@chakra-ui/react";

import Head from "components/Head";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";

export default function Task() {
  const router = useRouter();
  const {cid: classId, tid: taskId} = router.query;
  const url = `/api/classes/${classId}/activities/${taskId}/answers`;
  const {data: users, error, mutate} = useSWR(url);
  const userList = [];

  if (users) {
    users.forEach(u => {
      const task = (
        <UserItem
          key={u.id}
          fullname={u.fullname}
          avatar={u.avatar}
          value={u.feedback ? u.feedback.value : "N/A"}
          href={`${router.asPath}/${u.id}`}
        />
      );

      userList.push(task);
    });
  }

  return (
    <Container
      marginTop="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="800px"
    >
      <Head title="Untuk diperiksa - Algokata" />
      {(function () {
        if (!users && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (users) {
          return (
            <Box>
              <Flex
                paddingY="4"
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth="1px"
                borderBottomStyle="solid"
                borderBottomColor="green.600"
                marginBottom="6"
              >
                <Heading
                  as="h2"
                  fontSize="3xl"
                  fontWeight="medium"
                  color="green.600"
                >
                  Daftar siswa
                </Heading>
                <Text color="green.600" fontWeight="medium">
                  {userList.length} siswa
                </Text>
              </Flex>
              <Stack spacing="4">{userList}</Stack>
            </Box>
          );
        }

        if (!users && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}

function UserItem({avatar, fullname, value, href}) {
  return (
    <LinkBox
      backgroundColor="gray.100"
      borderRadius="lg"
      padding="3"
      _hover={{
        backgroundColor: "gray.200"
      }}
    >
      <NextLink href={href} passHref>
        <LinkOverlay>
          <Flex alignItems="center" justifyContent="space-between">
            <Flex>
              <Avatar size="sm" src={avatar} name={fullname} />
              <Text color="gray.600" textDecoration="none" marginLeft="4">
                {fullname}
              </Text>
            </Flex>
            <Text color="gray.600">{value}</Text>
          </Flex>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
}
