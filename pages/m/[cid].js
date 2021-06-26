import React from "react";
import {
  Container,
  Text,
  Heading,
  Box,
  Button,
  Flex,
  Avatar,
  List,
  ListItem
} from "@chakra-ui/react";
import {useRouter} from "next/router";
import useSWR from "swr";
import {withProtectedRoute} from "utils/routes";

import {NotFound as NotFoundIllustration} from "components/Illustrations";
import {Loader} from "components/Loader";

function ClassMembersPage() {
  const router = useRouter();
  const {
    data: classData,
    error,
    mutate
  } = useSWR(`/api/classes/${router.query.cid}/members`);
  console.log(classData);
  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="800px"
    >
      {!classData && error ? (
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
      {classData && Object.keys(classData).length > 0 ? (
        <React.Fragment>
          <Box marginBottom="8">
            <Heading
              as="h2"
              fontSize="3xl"
              fontWeight="medium"
              color="green.600"
              paddingY="4"
              borderBottomWidth="1px"
              borderBottomStyle="solid"
              borderBottomColor="green.600"
            >
              Pengajar
            </Heading>
            <Flex alignItems="center" marginTop="6">
              <Avatar
                size="sm"
                name={classData.teacher.fullname}
                src={classData.teacher.avatar}
              />
              <Text marginLeft="4" color="gray.600">
                {classData.teacher.fullname}
              </Text>
            </Flex>
          </Box>
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
                Murid
              </Heading>
              <Text color="green.600" fontWeight="medium">
                {classData.students.length} murid
              </Text>
            </Flex>
            {classData.students.length > 0 ? (
              <List>
                {classData.students.map(s => (
                  <ListItem
                    key={s.id}
                    _notLast={{
                      borderBottomWidth: "1px",
                      borderBottomStyle: "solid",
                      borderBottomColor: "gray.200"
                    }}
                  >
                    <Flex alignItems="center" padding="4">
                      <Avatar size="sm" name={s.fullname} src={s.avatar} />
                      <Text marginLeft="4" color="gray.600">
                        {s.fullname}
                      </Text>
                    </Flex>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Text color="gray.600" textAlign="center">
                Tidak ada murid
              </Text>
            )}
          </Box>
        </React.Fragment>
      ) : null}
      {classData && Object.keys(classData).length === 0 ? <NotFound /> : null}
      {!classData && !error ? <Loader /> : null}
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

export default withProtectedRoute(ClassMembersPage);
