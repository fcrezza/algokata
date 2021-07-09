import * as React from "react";
import {useRouter} from "next/router";
import useSWR from "swr";
import {GoKebabVertical} from "react-icons/go";
import {
  Container,
  Heading,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure
} from "@chakra-ui/react";

import Head from "components/Head";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import {useAuth} from "utils/auth";
import TaskItemList from "./TaskItemList";
import formatTimestamp from "utils/formatTimestamp";
import axios from "axios";
import EditTaskModal from "./EditTaskModal";

export default function Task() {
  const {user} = useAuth();
  const router = useRouter();
  const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}`;
  const {data: activity, error, mutate} = useSWR(url);
  const {
    onOpen: onEditModalOpen,
    onClose: onEditModalClose,
    isOpen: isEditModalOpen
  } = useDisclosure();

  async function handleEditTask(title, description) {
    const {data} = await axios.put(url, {title, description});
    await mutate(data, false);
    return data;
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
                    isOpen={isEditModalOpen}
                    onClose={onEditModalClose}
                    defaultTitle={activity.title}
                    defaultDescription={activity.description}
                    handleEditTask={handleEditTask}
                  />
                  <Menu placement="left-start" isLazy>
                    <MenuButton as={OptionButton} />
                    <MenuList>
                      <MenuItem onClick={onEditModalOpen}>Edit</MenuItem>
                      <MenuItem color="red.500">Hapus</MenuItem>
                    </MenuList>
                  </Menu>
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

const OptionButton = React.forwardRef((props, ref) => {
  return (
    <IconButton
      ref={ref}
      position="absolute"
      top="12px"
      right="0"
      variant="ghost"
      aria-label="opsi"
      icon={<GoKebabVertical size="18" />}
      isRound
      {...props}
    />
  );
});
