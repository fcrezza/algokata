import React from "react";
import axios from "axios";
import useSWR from "swr";
import {useRouter} from "next/router";
import {BiChevronDown} from "react-icons/bi";
import {
  Portal,
  VStack,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
  Text,
  Button,
  Flex
} from "@chakra-ui/react";

import Empty from "./Empty";
import AnnouncementCreatorModal from "./AnnouncementCreatorModal";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import AnnouncementItem from "./AnnouncementItem";
import TaskItem from "./TaskItem";
import ErrorFallback from "components/ErrorFallback";
import ConfirmationPrompt from "components/ConfirmationPrompt";
import {Loader} from "components/Loader";
import formatTimestamp from "utils/formatTimestamp";

const MODAL_TYPE = {
  NONE: 0,
  CREATE_TASK: 1,
  ANNOUNCEMENT: 2
};

export default function Activities({cls}) {
  const router = useRouter();
  const url = `/api/classes/${router.query.cid}/activities?order=desc`;
  const {data: activites, error, mutate} = useSWR(url);
  const [modal, setModal] = React.useState(MODAL_TYPE.NONE);
  const [editTask, setEditTask] = React.useState(null);
  const [deleteActivity, setDeleteActivity] = React.useState(null);

  const onClose = () => {
    setModal(MODAL_TYPE.NONE);
  };

  const onCreateTask = async taskData => {
    const {data} = await axios.post(
      `/api/classes/${router.query.cid}/activities`,
      taskData
    );
    await mutate(prevData => [data, ...prevData], false);
  };

  const onEditTask = async (title, description) => {
    const url = `/api/classes/${router.query.cid}/activities/${editTask.id}`;
    const {data} = await axios.put(url, {title, description});
    const newActivitesData = activites.map(a => {
      if (a.id == data.id) {
        a.title = data.title;
        a.description = data.description;
      }

      return a;
    });
    await mutate(newActivitesData, false);
  };

  const onCreateAnnouncement = async announcementData => {
    const {data} = await axios.post(
      `/api/classes/${router.query.cid}/activities`,
      announcementData
    );

    await mutate(prevData => [data, ...prevData], false);
  };

  const onDeleteActivity = async () => {
    const url = `/api/classes/${router.query.cid}/activities/${deleteActivity.id}`;
    await axios.delete(url);
    const filterData = prevData =>
      prevData.filter(d => d.id !== deleteActivity.id);
    await mutate(filterData, false);
  };

  return (
    <React.Fragment>
      <Flex justifyContent="space-between" marginTop="8">
        <Text fontWeight="bold" color="gray.800" fontSize="3xl">
          Aktifitas
        </Text>
        {cls.isTeacher ? (
          <React.Fragment>
            <CreateTaskModal
              isOpen={modal === MODAL_TYPE.CREATE_TASK}
              onClose={onClose}
              onCreate={onCreateTask}
            />
            <EditTaskModal
              key={Boolean(editTask)}
              isOpen={Boolean(editTask)}
              onClose={() => setEditTask(null)}
              defaultTitle={editTask ? editTask.title : ""}
              defaultDescription={editTask ? editTask.description : ""}
              handleEditTask={onEditTask}
            />
            <AnnouncementCreatorModal
              isOpen={modal === MODAL_TYPE.ANNOUNCEMENT}
              onClose={onClose}
              onCreate={onCreateAnnouncement}
            />
            <ConfirmationPrompt
              title={
                deleteActivity && deleteActivity.type === "task"
                  ? "Hapus Tugas"
                  : "Hapus Pengumuman"
              }
              description={
                deleteActivity && deleteActivity.type === "task"
                  ? "Semua data tugas akan dihapus, yakin ingin melanjutkan?"
                  : "Yakin ingin menghapus pengumuman?"
              }
              actionTitle="Hapus"
              isOpen={Boolean(deleteActivity)}
              errorMessage="Operasi gagal dilakukan"
              successMessage="Item berhasil dihapus"
              onClose={() => setDeleteActivity(null)}
              onConfirmation={onDeleteActivity}
            />
            <Menu isLazy>
              <MenuButton as={Button} rightIcon={<BiChevronDown size="18" />}>
                Buat
              </MenuButton>
              <Portal>
                <MenuList>
                  <MenuItem onClick={() => setModal(MODAL_TYPE.CREATE_TASK)}>
                    Buat Tugas
                  </MenuItem>
                  <MenuItem onClick={() => setModal(MODAL_TYPE.ANNOUNCEMENT)}>
                    Buat Pengumuman
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </React.Fragment>
        ) : null}
      </Flex>
      {(function () {
        if (!activites && error) {
          if (error.response && error.response.data.error.code === 404) {
            return (
              <Text color="gray.600" textAlign="center" marginTop="8">
                {error.response.data.error.message}
              </Text>
            );
          }

          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (activites && activites.length > 0) {
          const activityList = activites.map(a => {
            if (a.type === "announcement") {
              return (
                <AnnouncementItem
                  key={a.id}
                  title={a.title}
                  message={a.message}
                  timestamp={formatTimestamp(a.createdAt)}
                  isTeacher={cls.isTeacher ? true : false}
                  onDelete={() =>
                    setDeleteActivity({
                      id: a.id,
                      type: "announcement"
                    })
                  }
                />
              );
            }

            if (a.type === "task") {
              return (
                <TaskItem
                  key={a.id}
                  title={a.title}
                  timestamp={formatTimestamp(a.createdAt)}
                  url={`/c/${router.query.cid}/${a.id}`}
                  isTeacher={cls.isTeacher ? true : false}
                  onDelete={() =>
                    setDeleteActivity({
                      id: a.id,
                      type: "task"
                    })
                  }
                  onEdit={() =>
                    setEditTask({
                      id: a.id,
                      title: a.title,
                      description: a.description
                    })
                  }
                />
              );
            }
          });

          return (
            <VStack marginTop="8" spacing="6" flex="1" alignItems="stretch">
              {activityList}
            </VStack>
          );
        }

        if (activites && activites.length === 0) {
          return <Empty isTeacher={cls.isTeacher} />;
        }

        if (!activites && !error) {
          return <Loader />;
        }
      })()}
    </React.Fragment>
  );
}
