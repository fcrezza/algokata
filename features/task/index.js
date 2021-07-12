import * as React from "react";
import axios from "axios";
import useSWR from "swr";
import {useRouter} from "next/router";
import {Box, Container, Heading, Text} from "@chakra-ui/react";

import TaskItemList from "./TaskItemList";
import formatTimestamp from "utils/formatTimestamp";
import EditTaskModal from "./EditTaskModal";
import Menu from "./Menu";
import Head from "components/Head";
import ConfirmationPrompt from "components/ConfirmationPrompt";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import {useAuth} from "utils/auth";

const DISCLOSURE_TYPE = {
  NONE: 0,
  EDIT: 1,
  DELETE: 2
};

function fetcher(taskUrl, feedbackUrl) {
  const task = axios.get(taskUrl);
  const feedback = feedbackUrl ? axios.get(feedbackUrl) : null;

  return Promise.all([task, feedback])
    .then(res => res.map(r => r?.data))
    .catch(e => {
      if (
        e.response &&
        e.response.data.error.code === 404 &&
        e.response.config.url === feedbackUrl
      ) {
        return Promise.all([task, null]).then(res => res.map(r => r?.data));
      }

      throw e;
    });
}

export default function Task() {
  const {user} = useAuth();
  const isTeacher = user?.role === "teacher";
  const router = useRouter();
  const {cid: classId, tid: taskId} = router.query;
  const {data, error, mutate} = useSWR(
    [
      `/api/classes/${classId}/activities/${taskId}`,
      !isTeacher
        ? `/api/classes/${classId}/activities/${taskId}/feedbacks?userId=${user.id}`
        : null
    ],
    fetcher
  );
  const [disclosure, setDisclosure] = React.useState();

  function handleCloseDisclosure() {
    setDisclosure(DISCLOSURE_TYPE.NONE);
  }

  async function handleEditTask(title, description) {
    const url = `/api/classes/${classId}/activities/${taskId}`;
    const {data} = await axios.put(url, {title, description});
    await mutate(data, false);
    return data;
  }

  async function handleDeleteTask() {
    const url = `/api/classes/${classId}/activities/${taskId}`;
    await axios.delete(url);
  }

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="800px"
      position="relative"
    >
      {(() => {
        if (!data && error) {
          if (error.response && error.response.data.error.code === 404) {
            return (
              <React.Fragment>
                <Head title="404 Tidak ditemukan" />
                <Text color="gray.600" textAlign="center">
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
          const [task, feedback] = data;
          return (
            <React.Fragment>
              <Head title={`Kelas - ${task.title}`} />
              {isTeacher ? (
                <React.Fragment>
                  <EditTaskModal
                    isOpen={disclosure === DISCLOSURE_TYPE.EDIT}
                    onClose={handleCloseDisclosure}
                    defaultTitle={task.title}
                    defaultDescription={task.description}
                    handleEditTask={handleEditTask}
                  />
                  <ConfirmationPrompt
                    isOpen={disclosure === DISCLOSURE_TYPE.DELETE}
                    onClose={handleCloseDisclosure}
                    title="Hapus Tugas"
                    description="Semua data tugas akan dihapus, yakin ingin melanjutkan?"
                    actionTitle="Hapus"
                    successMessage="Item berhasil dihapus"
                    errorMessage="Operasi gagal dijalankan"
                    onConfirmation={handleDeleteTask}
                    onSuccess={() => router.push(`/c/${classId}`)}
                  />
                  <Menu
                    onEdit={() => setDisclosure(DISCLOSURE_TYPE.EDIT)}
                    onDelete={() => setDisclosure(DISCLOSURE_TYPE.DELETE)}
                  />
                </React.Fragment>
              ) : null}
              <Text color="gray.600" fontSize="sm" marginBottom="3">
                {formatTimestamp(task.createdAt)}
              </Text>
              <Heading color="gray.800" marginBottom="5">
                {task.title}
              </Heading>
              <Text color="gray.600" fontSize="lg">
                {task.description}
              </Text>
              {!isTeacher ? (
                <Box
                  marginTop="6"
                  borderColor="gray.200"
                  borderWidth="1px"
                  borderStyle="solid"
                  padding="4"
                >
                  {feedback ? (
                    <React.Fragment>
                      <Text color="green.600" fontWeight="bold" fontSize="2xl">
                        Nilai kamu: {feedback.value}
                      </Text>
                      <Text color="gray.600" marginTop="2">
                        {feedback.message}
                      </Text>
                    </React.Fragment>
                  ) : (
                    <Text color="gray.600">Belum ada nilai untuk kamu</Text>
                  )}
                </Box>
              ) : null}
              <TaskItemList />
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
