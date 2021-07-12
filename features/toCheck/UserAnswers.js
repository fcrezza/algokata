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

function fetcher(studentUrl, feedbackUrl, taskAnswersUrl) {
  const student = axios.get(studentUrl);
  const taskAnswers = axios.get(taskAnswersUrl);
  const feedback = axios.get(feedbackUrl);

  return Promise.all([student, feedback, taskAnswers])
    .then(res => res.map(r => r.data))
    .catch(e => {
      if (
        e.response &&
        e.response.data.error.code === 404 &&
        e.response.config.url === feedbackUrl
      ) {
        return Promise.all([student, null, taskAnswers]).then(res =>
          res.map(r => r?.data)
        );
      }

      throw e;
    });
}

export default function UserAnswers() {
  const router = useRouter();
  const {cid: classId, tid: taskId, uid: userId} = router.query;
  const {data, mutate, error} = useSWR(
    [
      `/api/classes/${classId}/members/${userId}`,
      `/api/classes/${classId}/activities/${taskId}/feedbacks?userId=${userId}`,
      `/api/classes/${classId}/activities/${taskId}/answers?userId=${userId}`
    ],
    fetcher
  );
  const {isOpen, onOpen, onClose} = useDisclosure();

  async function handleGiveFeedback(value, message) {
    const [student, , answers] = data;
    const url = `/api/classes/${classId}/activities/${taskId}/feedbacks`;
    const {data: newData} = await axios.post(url, {
      studentId: student.id,
      value,
      message
    });
    await mutate([student, newData, answers], false);
    return newData;
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
        if (!data && error) {
          if (error.response && error.response.data.error.code === 404) {
            return (
              <React.Fragment>
                <Head title="Untuk diperiksa - 404 Tidak ditemukan" />
                <Text textAlign="center" color="gray.600">
                  {error.response.data.error.message}
                </Text>
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

        if (data) {
          const [student, feedback, answers] = data;
          const answerList = answers.map(a => (
            <AnswerItem
              key={a.id}
              solutionCode={a.solutionCode}
              title={a.taskItem.title}
            />
          ));

          return (
            <React.Fragment>
              <Head title={`Untuk diperiksa - Jawaban ${student.fullname}`} />
              <FeedbackModal
                isOpen={isOpen}
                onClose={onClose}
                onSubmit={handleGiveFeedback}
                defaultValue={feedback ? feedback.value : 0}
                defaultMessage={feedback ? feedback.message : ""}
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
                      src={student.avatar}
                      name={student.fullname}
                    />
                    <Text color="gray.600" marginLeft="3">
                      {student.fullname}
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
                {feedback ? (
                  <React.Fragment>
                    <Text fontSize="2xl" fontWeight="bold" color="green.600">
                      {feedback.value}
                    </Text>
                    <Text marginTop="3" color="gray.600">
                      {feedback.message}
                    </Text>
                  </React.Fragment>
                ) : (
                  <Text color="gray.600">Kamu belum memberikan penilaian</Text>
                )}
              </Box>
              {answerList.length > 0 ? (
                <Stack spacing="8" marginTop="8">
                  {answerList}
                </Stack>
              ) : (
                <Text textAlign="center" color="gray.600" marginTop="8">
                  Belum ada jawaban yang dikirim
                </Text>
              )}
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
