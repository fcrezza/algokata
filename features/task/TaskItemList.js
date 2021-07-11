import * as React from "react";
import {useRouter} from "next/router";
import axios from "axios";
import useSWR from "swr";
import {Button, Flex, Stack, useDisclosure, Icon} from "@chakra-ui/react";
import {VscCircleOutline} from "react-icons/vsc";
import {MdCheckCircle, MdAdd} from "react-icons/md";

import TaskItemCreatorModal from "./TaskItemCreatorModal";
import TaskItem from "./TaskItem";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import {useAuth} from "utils/auth";

function fetcher(taskItemsUrl, taskAnswersUrl) {
  const taskItems = axios.get(taskItemsUrl);
  const taskAnswers = taskAnswersUrl ? axios.get(taskAnswersUrl) : null;
  return Promise.all([taskItems, taskAnswers]).then(res =>
    res.map(r => r?.data)
  );
}

export default function TaskItemList() {
  const {user} = useAuth();
  const router = useRouter();
  const isTeacher = user?.role === "teacher";
  const {isOpen, onClose, onOpen} = useDisclosure();
  const [editValues, setEditValues] = React.useState(null);
  const {data, error, mutate} = useSWR(
    [
      `/api/classes/${router.query.cid}/activities/${router.query.tid}/items`,
      !isTeacher
        ? `/api/classes/${router.query.cid}/activities/${router.query.tid}/answers?userId=${user.id}`
        : null
    ],
    fetcher
  );

  function onEdit(item) {
    setEditValues(item);
    onOpen();
  }

  function closeModal() {
    onClose();
    if (editValues) {
      setEditValues(null);
    }
  }

  async function handleCreateItem(formData) {
    const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}/items`;
    await axios.post(url, formData);
    await mutate();
  }

  async function handleDeleteItem() {
    const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}/items?itemId=${editValues.id}`;
    await axios.delete(url);
    await mutate();
  }

  async function handleSaveChanges(formData) {
    const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}/items?itemId=${editValues.id}`;
    await axios.put(url, formData);
    await mutate();
  }

  if (!data && error) {
    return (
      <Flex marginTop="10" justifyContent="center">
        <ErrorFallback
          errorMessage="Upsss, Gagal memuat data"
          onRetry={() => mutate(null)}
        />
      </Flex>
    );
  }

  if (data) {
    const [taskItems, taskAnswers] = data;
    const list = taskItems.map(i => {
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
        const isAnswerExists = taskAnswers.find(a => a.taskItem.id === i.id);
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
        <TaskItemCreatorModal
          key={Boolean(editValues)}
          isOpen={isOpen}
          onClose={closeModal}
          defaultValues={editValues ?? {}}
          handleCreateItem={handleCreateItem}
          handleSaveChanges={handleSaveChanges}
          handleDeleteItem={handleDeleteItem}
        />
        <Stack marginTop="6" spacing="4">
          {list}
          {isTeacher ? (
            <Button colorScheme="green" onClick={onOpen}>
              <MdAdd size="24" />
            </Button>
          ) : null}
        </Stack>
      </React.Fragment>
    );
  }

  if (!data && !error) {
    return (
      <Flex marginTop="10" justifyContent="center">
        <Loader />
      </Flex>
    );
  }
}
