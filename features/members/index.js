import React from "react";
import {
  Container,
  Text,
  Heading,
  Box,
  Flex,
  Avatar,
  List
} from "@chakra-ui/react";
import {useRouter} from "next/router";
import useSWR from "swr";
import axios from "axios";

import NotFound from "./NotFound";
import StudentItem from "./StudentItem";
import {Loader} from "components/Loader";
import ErrorFallback from "components/ErrorFallback";

function fetcher(classUrl, classMemberUrl) {
  const cls = axios.get(classUrl);
  const members = axios.get(classMemberUrl);
  return Promise.all([cls, members]);
}

export default function ClassMembers() {
  const router = useRouter();
  const {data, error, mutate} = useSWR(
    [
      `/api/classes/${router.query.cid}`,
      `/api/classes/${router.query.cid}/members`
    ],
    fetcher
  );

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="800px"
    >
      {(function () {
        if (!data && error) {
          if (error.response && error.response.data.error.code === 404) {
            return <NotFound />;
          }

          return (
            <ErrorFallback
              errorMessage="Upss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (data) {
          const [cls, students] = data;
          const studentItems = students.data.map(s => (
            <StudentItem key={s.id} fullname={s.fullname} avatar={s.avatar} />
          ));

          return (
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
                    name={cls.data.teacher.fullname}
                    src={cls.data.teacher.avatar}
                  />
                  <Text marginLeft="4" color="gray.600">
                    {cls.data.teacher.fullname}
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
                    {studentItems.length} murid
                  </Text>
                </Flex>
                {studentItems.length > 0 ? (
                  <List>{studentItems}</List>
                ) : (
                  <Text color="gray.600" textAlign="center">
                    Tidak ada murid
                  </Text>
                )}
              </Box>
            </React.Fragment>
          );
        }

        if (!data && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}
