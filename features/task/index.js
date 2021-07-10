import * as React from "react";
import axios from "axios";
import useSWR from "swr";
import {useRouter} from "next/router";
import {Container, Heading, Text} from "@chakra-ui/react";

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

export default function Task() {
  const {user} = useAuth();
  const router = useRouter();
  const {cid: classId, tid: taskId} = router.query;
  const url = `/api/classes/${classId}/activities/${taskId}`;
  const {data: activity, error, mutate} = useSWR(url);
  const [disclosure, setDisclosure] = React.useState();

  function handleCloseDisclosure() {
    setDisclosure(DISCLOSURE_TYPE.NONE);
  }

  async function handleEditTask(title, description) {
    const {data} = await axios.put(url, {title, description});
    await mutate(data, false);
    return data;
  }

  async function handleDeleteTask() {
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
        if (!activity && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (activity) {
          return (
            <React.Fragment>
              <Head
                title={
                  activity ? `Kelas - ${activity.title}` : "404 Tidak ditemukan"
                }
              />
              {user.role === "teacher" ? (
                <React.Fragment>
                  <EditTaskModal
                    isOpen={disclosure === DISCLOSURE_TYPE.EDIT}
                    onClose={handleCloseDisclosure}
                    defaultTitle={activity.title}
                    defaultDescription={activity.description}
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
                {formatTimestamp(activity.createdAt)}
              </Text>
              <Heading color="gray.800" marginBottom="5">
                {activity.title}
              </Heading>
              <Text color="gray.600" fontSize="lg">
                {activity.description}
              </Text>
              <TaskItemList />
            </React.Fragment>
          );
        }

        if (!activity && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}
