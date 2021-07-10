import React from "react";
import {useRouter} from "next/router";
import useSWR from "swr";
import {
  Container,
  Stack,
  Text,
  Box,
  Avatar,
  Flex,
  Button,
  useDisclosure
} from "@chakra-ui/react";

import FeedbackModal from "./FeedbackModal";
import AnswerItem from "./AnswerItem";
import Head from "components/Head";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import axios from "axios";

export default function UserAnswers() {
  const router = useRouter();
  const {cid: classId, tid: taskId, uid: userId} = router.query;
  const url = `/api/classes/${classId}/activities/${taskId}/answers?userId=${userId}`;
  const {data: answers, error, mutate} = useSWR(url);
  const answerList = [];
  const {isOpen, onOpen, onClose} = useDisclosure();

  async function handleGiveFeedback(value, message) {
    const {data} = await axios.put(url, {value, message});
    await mutate(data, false);
  }

  if (answers) {
    answers.answers.forEach(a => {
      const task = (
        <AnswerItem
          key={a.id}
          solutionCode={a.solutionCode}
          title={a.taskItem.title}
        />
      );

      answerList.push(task);
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
      {(function () {
        if (!answers && error) {
          if (error?.response.data.error.code === 404) {
            return (
              <React.Fragment>
                <Head title="Untuk diperiksa - data tidak ditemukan" />
                <Text textAlign="center">Data tidak ditemukan</Text>
              </React.Fragment>
            );
          }

          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (answers) {
          return (
            <React.Fragment>
              <Head title={`Untuk diperiksa - Jawaban ${answers.fullname}`} />
              <FeedbackModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={handleGiveFeedback}
              />
              <Flex
                justifyContent="space-between"
                alignItems="center"
                padding="4"
                borderWidth="1px"
                borderColor="gray.200"
                borderStyle="solid"
              >
                <Box>
                  <Text color="gray.600" fontWeight="semibold" fontSize="lg">
                    Jawaban dari:
                  </Text>
                  <Flex alignItems="center" marginTop="3">
                    <Avatar
                      size="sm"
                      src={answers.avatar}
                      name={answers.fullname}
                    />
                    <Text color="gray.600" marginLeft="3">
                      {answers.fullname}
                    </Text>
                  </Flex>
                </Box>
                <Button colorScheme="green" onClick={onOpen}>
                  Beri nilai
                </Button>
              </Flex>
              <Box
                marginTop="4"
                padding="4"
                borderWidth="1px"
                borderColor="gray.200"
                borderStyle="solid"
              >
                {answers.feedback ? (
                  <React.Fragment>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {answers.feedback.value}
                    </Text>
                    <Text marginTop="3" color="gray.600">
                      {answers.feedback.message}
                    </Text>
                  </React.Fragment>
                ) : (
                  <Text color="gray.600">Kamu belum memberikan penilaian</Text>
                )}
              </Box>
              <Stack spacing="8" marginTop="8">
                {answerList}
              </Stack>
            </React.Fragment>
          );
        }

        if (!answers && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}
