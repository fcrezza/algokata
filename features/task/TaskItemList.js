import * as React from "react";
import {useRouter} from "next/router";
import {
  Button,
  Flex,
  Stack,
  useDisclosure,
  Icon,
  Box,
  Text
} from "@chakra-ui/react";
import {VscCircleOutline} from "react-icons/vsc";
import {MdCheckCircle, MdAdd} from "react-icons/md";

import TaskItemCreatorModal from "./TaskItemCreatorModal";
import TaskItem from "./TaskItem";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import {useAuth} from "utils/auth";
import {useFetchTaskAnswers, useFetchTaskItems} from "./utils";
import axios from "axios";

export default function TaskItemList() {
  const {user} = useAuth();
  const router = useRouter();
  const {isOpen, onClose, onOpen} = useDisclosure();
  const [editValues, setEditValues] = React.useState({});
  const taskItems = useFetchTaskItems();
  const taskAnswers = useFetchTaskAnswers();
  const isTeacher = user?.role === "teacher";

  function retry() {
    if (taskItems.isError) {
      taskItems.mutate(null);
    } else if (taskAnswers.isError) {
      taskAnswers.mutate(null);
    }
  }

  function onEdit(item) {
    setEditValues(item);
    onOpen();
  }

  function onCreate() {
    setEditValues({});
    onOpen();
  }

  async function handleCreateItem(formData) {
    const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}`;
    await axios.post(url, formData);
    await taskItems.mutate();
  }

  async function handleDeleteItem() {
    const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}/items?itemId=${editValues.id}`;
    await axios.delete(url);
    await taskItems.mutate();
  }

  async function handleSaveChanges(formData) {
    const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}/items?itemId=${editValues.id}`;
    await axios.put(url, formData);
    await taskItems.mutate();
  }

  if (taskItems.isError || taskAnswers.isError) {
    return (
      <Flex marginTop="10" justifyContent="center">
        <ErrorFallback
          errorMessage="Upsss, Gagal memuat data"
          onRetry={retry}
        />
      </Flex>
    );
  }

  if (taskItems.data && taskAnswers.data) {
    const list = taskItems.data.map(i => {
      const isAnswerExists = taskAnswers.data?.answers?.find(
        a => a.taskItem.id === i.id
      );
      let rightElement = null;

      if (isTeacher) {
        rightElement = (
          <Button
            className="edit-button"
            variant="ghost"
            display="none"
            size="sm"
            onClick={() => onEdit(i)}
          >
            Edit
          </Button>
        );
      } else {
        rightElement = (
          <Icon
            as={isAnswerExists ? MdCheckCircle : VscCircleOutline}
            color={isAnswerExists ? "green.600" : "gray.500"}
            boxSize="6"
          />
        );
      }

      return (
        <TaskItem
          key={i.id}
          title={i.title}
          href={`${router.asPath}/${i.id}`}
          rightElement={rightElement}
        />
      );
    });

    return (
      <React.Fragment>
        {isOpen ? (
          <TaskItemCreatorModal
            isOpen={isOpen}
            onClose={onClose}
            defaultValues={editValues}
            handleCreateItem={handleCreateItem}
            handleSaveChanges={handleSaveChanges}
            handleDeleteItem={handleDeleteItem}
          />
        ) : null}
        {!isTeacher ? (
          <Box
            marginTop="6"
            borderColor="gray.200"
            borderWidth="1px"
            borderStyle="solid"
            padding="4"
          >
            {taskAnswers.data.feedback ? (
              <React.Fragment>
                <Text color="green.600" fontWeight="bold" fontSize="2xl">
                  Nilai kamu: {taskAnswers.data.feedback.value}
                </Text>
                <Text color="gray.600" marginTop="2">
                  {taskAnswers.data.feedback.message}
                </Text>
              </React.Fragment>
            ) : (
              <Text color="gray.200">Belum ada nilai untuk kamu</Text>
            )}
          </Box>
        ) : null}
        <Stack marginTop="6" spacing="4">
          {list}
          {isTeacher ? (
            <Button colorScheme="green" onClick={onCreate}>
              <MdAdd size="24" />
            </Button>
          ) : null}
        </Stack>
      </React.Fragment>
    );
  }

  if (taskItems.isLoading || taskAnswers.isLoading) {
    return (
      <Flex marginTop="10" justifyContent="center">
        <Loader />
      </Flex>
    );
  }
}
