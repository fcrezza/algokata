import React from "react";
import axios from "axios";
import NextLink from "next/link";
import useSWR from "swr";
import {useRouter} from "next/router";
import {
  Portal,
  VStack,
  List,
  ListItem,
  ListIcon,
  MenuButton,
  LinkBox,
  LinkOverlay,
  MenuList,
  MenuItem,
  Menu,
  Icon,
  Box,
  Text,
  Button,
  IconButton,
  Heading,
  Flex,
  useDisclosure
} from "@chakra-ui/react";
import {GoKebabVertical} from "react-icons/go";
import {BiChevronDown, BiInfoCircle, BiTask} from "react-icons/bi";
import {MdClass, MdInfo} from "react-icons/md";
import {format} from "date-fns";

import AnnouncementCreatorModal from "./AnnouncementCreatorModal";
import {Loader} from "components/Loader";
import CreateTaskModal from "./CreateTaskModal";
import ErrorFallback from "./ErrorFallback";
import ConfirmationPrompt from "./ConfirmationPrompt";
import EditTaskModal from "./EditTaskModal";

const MODAL_TYPE = {
  NONE: 0,
  CREATE_TASK: 1,
  EDIT_TASK: 2,
  ANNOUNCEMENT: 3
};

export default function Activities({cls}) {
  const [modal, setModal] = React.useState(MODAL_TYPE.NONE);
  const router = useRouter();
  const url = `/api/classes/${router.query.cid}/activities?order=desc`;
  const {data: activites, error, mutate} = useSWR(url);
  const [editTask, setEditTask] = React.useState({
    id: "",
    title: "",
    description: ""
  });

  const onClose = () => {
    setModal(MODAL_TYPE.NONE);
  };

  const onCreateTask = async taskData => {
    await axios.post(url, taskData);
    await mutate();
  };

  const openEditModal = (id, title, description) => {
    setEditTask({id, title, description});
    setModal(MODAL_TYPE.EDIT_TASK);
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
    setEditTask({
      id: "",
      title: "",
      description: ""
    });
    return data;
  };

  const onCreateAnnouncement = async announcementData => {
    await axios.post(url, announcementData);
    await mutate();
  };

  const onDeleteActivity = async activityId => {
    await axios.delete(`${url}/${activityId}`);
    await mutate();
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
            {modal === MODAL_TYPE.EDIT_TASK ? (
              <EditTaskModal
                isOpen={modal === MODAL_TYPE.EDIT_TASK}
                onClose={onClose}
                defaultTitle={editTask.title}
                defaultDescription={editTask.description}
                handleEditTask={onEditTask}
              />
            ) : null}
            <AnnouncementCreatorModal
              isOpen={modal === MODAL_TYPE.ANNOUNCEMENT}
              onClose={onClose}
              handleSubmit={onCreateAnnouncement}
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
                const timestamp = format(
                  new Date(activity.createdAt),
                  "e LLL yyyy"
                );

                if (activity.type === "announcement") {
                  return (
                    <Announcement
                      key={activity.id}
                      title={activity.title}
                      message={activity.message}
                      timestamp={timestamp}
                      isTeacher={cls.isTeacher ? true : false}
                      onDelete={() => onDeleteActivity(activity.id)}
                    />
                  );
                }

                if (activity.type === "task") {
                  return (
                    <Task
                      key={activity.id}
                      title={activity.title}
                      timestamp={timestamp}
                      url={`/c/${router.query.cid}/${activity.id}`}
                      isTeacher={cls.isTeacher ? true : false}
                      onEdit={() =>
                        openEditModal(
                          activity.id,
                          activity.title,
                          activity.description
                        )
                      }
                      // onDelete={() => onDeleteActivity(activity.id)}
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

const OptionButton = React.forwardRef((props, ref) => {
  return (
    <IconButton
      ref={ref}
      position="absolute"
      variant="ghost"
      top="8px"
      right="8px"
      aria-label="opsi"
      icon={<GoKebabVertical size="18" />}
      isRound
      {...props}
    />
  );
});

function Task({timestamp, url, title, isTeacher, onEdit}) {
  return (
    <LinkBox
      _hover={{
        backgroundColor: "gray.50"
      }}
      position="relative"
    >
      <NextLink href={url} passHref>
        <LinkOverlay>
          <Flex
            paddingX="4"
            paddingY="5"
            borderRadius="lg"
            borderColor="gray.200"
            borderStyle="solid"
            borderWidth="1px"
          >
            <Icon as={MdClass} fontSize="40" color="green.500" />
            <Box marginLeft="5">
              <Text fontSize="sm" color="gray.500" marginBottom="1">
                {timestamp}
              </Text>
              <Text color="gray.800" fontWeight="semibold" fontSize="lg">
                {title}
              </Text>
            </Box>
          </Flex>
        </LinkOverlay>
      </NextLink>
      {isTeacher ? (
        <Menu placement="left-start" isLazy>
          <MenuButton as={OptionButton} />
          <MenuList>
            <MenuItem onClick={onEdit}>Edit</MenuItem>
            <MenuItem color="red.500">Hapus</MenuItem>
          </MenuList>
        </Menu>
      ) : null}
    </LinkBox>
  );
}

function Announcement(props) {
  const {title, message, timestamp, isTeacher, onDelete} = props;
  const {isOpen, onClose, onOpen} = useDisclosure();

  return (
    <React.Fragment>
      <ConfirmationPrompt
        title="Hapus Pengumuman"
        description="Yakin ingin menghapus pengumuman?"
        actionTitle="Hapus"
        isOpen={isOpen}
        onClose={onClose}
        onConfirmation={onDelete}
      />
      <Flex
        paddingX="4"
        paddingY="5"
        borderRadius="lg"
        borderColor="gray.200"
        borderStyle="solid"
        borderWidth="1px"
        position="relative"
      >
        <Icon as={MdInfo} fontSize="48" color="green.500" />
        <Box marginLeft="5">
          <Text fontSize="sm" color="gray.500" marginBottom="2">
            {timestamp}
          </Text>
          <Heading
            as="h2"
            fontSize="xl"
            color="gray.800"
            marginBottom="3"
            fontWeight="semibold"
          >
            {title}
          </Heading>
          <Text color="gray.600">{message}</Text>
        </Box>
        {isTeacher ? (
          <Menu placement="left-start" isLazy>
            <MenuButton as={OptionButton} />
            <MenuList>
              <MenuItem color="red.500" onClick={onOpen}>
                Hapus
              </MenuItem>
            </MenuList>
          </Menu>
        ) : null}
      </Flex>
    </React.Fragment>
  );
}
