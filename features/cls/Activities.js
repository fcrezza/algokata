import React from "react";
import axios from "axios";
import useSWR from "swr";
import {useRouter} from "next/router";
import {BiChevronDown, BiInfoCircle, BiTask} from "react-icons/bi";
import {
  Portal,
  VStack,
  List,
  ListItem,
  ListIcon,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
  Box,
  Text,
  Button,
  Heading,
  Flex
} from "@chakra-ui/react";

import AnnouncementCreatorModal from "./AnnouncementCreatorModal";
import CreateTaskModal from "./CreateTaskModal";
import ErrorFallback from "./ErrorFallback";
import EditTaskModal from "./EditTaskModal";
import AnnouncementItem from "./AnnouncementItem";
import TaskItem from "./TaskItem";
import ConfirmationPrompt from "components/ConfirmationPrompt";
import {Loader} from "components/Loader";
import formatTimestamp from "utils/formatTimestamp";

const MODAL_TYPE = {
  NONE: 0,
  CREATE_TASK: 1,
  ANNOUNCEMENT: 2
};

export default function Activities({cls}) {
  const [modal, setModal] = React.useState(MODAL_TYPE.NONE);
  const router = useRouter();
  const url = `/api/classes/${router.query.cid}/activities?order=desc`;
  const {data: activites, error, mutate} = useSWR(url);
  const [editTask, setEditTask] = React.useState(null);
  const [deleteActivity, setDeleteActivity] = React.useState(null);

  const onClose = () => {
    setModal(MODAL_TYPE.NONE);
  };

  const onCreateTask = async taskData => {
    await axios.post(url, taskData);
    await mutate();
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
    await axios.post(url, announcementData);
    await mutate();
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
              handleSubmit={onCreateTask}
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
              handleSubmit={onCreateAnnouncement}
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
      {(() => {
        if (!cls && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (activites && activites.length > 0) {
          return (
            <VStack marginTop="8" spacing="6" flex="1" alignItems="stretch">
              {activites.map(activity => {
                if (activity.type === "announcement") {
                  return (
                    <AnnouncementItem
                      key={activity.id}
                      title={activity.title}
                      message={activity.message}
                      timestamp={formatTimestamp(activity.createdAt)}
                      isTeacher={cls.isTeacher ? true : false}
                      onDelete={() =>
                        setDeleteActivity({
                          id: activity.id,
                          type: "announcement"
                        })
                      }
                    />
                  );
                }

                if (activity.type === "task") {
                  return (
                    <TaskItem
                      key={activity.id}
                      title={activity.title}
                      timestamp={formatTimestamp(activity.createdAt)}
                      url={`/c/${router.query.cid}/${activity.id}`}
                      isTeacher={cls.isTeacher ? true : false}
                      onDelete={() =>
                        setDeleteActivity({
                          id: activity.id,
                          type: "task"
                        })
                      }
                      onEdit={() =>
                        setEditTask({
                          id: activity.id,
                          title: activity.title,
                          description: activity.description
                        })
                      }
                    />
                  );
                }
              })}
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

function Empty({isTeacher}) {
  if (isTeacher) {
    return (
      <Box
        marginTop="8"
        padding="6"
        borderRadius="lg"
        borderColor="gray.300"
        borderWidth="1px"
        borderStyle="solid"
      >
        <Heading as="h3" color="green.600" fontWeight="medium" fontSize="2xl">
          Mulai interaksi dengan murid di kelas anda
        </Heading>
        <List marginTop="6" spacing="3">
          <ListItem color="gray.600">
            <ListIcon as={BiInfoCircle} fontSize="20px" />
            Buat pengumuman untuk memberitahu info penting
          </ListItem>
          <ListItem color="gray.600">
            <ListIcon as={BiTask} fontSize="20px" />
            Buat tugas untuk murid anda
          </ListItem>
        </List>
      </Box>
    );
  }

  return <div>tidak ada apa-apa disini</div>;
}
