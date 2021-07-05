import * as React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  CloseButton,
  Box,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Button,
  Flex,
  Heading,
  Select
} from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/dist/markdown-editor.css";
import "@uiw/react-markdown-preview/dist/markdown.css";
import useSWR from "swr";
import {useRouter} from "next/router";

import {Loader} from "components/Loader";
import ErrorFallback from "components/ErrorFallback";

export default function DiscussionCreatorModal({isOpen, onClose, onCreate}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedTask, setSelectedTask] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const url = `/api/classes/${router.query.cid}/activities?type=task&order=asc`;
  const {data: tasks, error, mutate} = useSWR(url);
  const mdRef = React.useRef();
  const toast = useToast();
  const selectOptions = [];

  function closeModal() {
    setTitle("");
    setDescription("");
    setSelectedTask("");
    onClose();
  }

  async function handleSubmit() {
    try {
      setIsSubmitting(true);
      const {taskId, taskItemId} = JSON.parse(selectedTask);
      await onCreate(title, description, taskId, taskItemId);
      setIsSubmitting(false);
      closeModal();
      toast({
        status: "success",
        title: `Diskusi berhasil dikirim`,
        isClosable: true
      });
    } catch (error) {
      setIsSubmitting(false);
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
  }

  if (tasks) {
    tasks.forEach(function (task) {
      const taskOption = (
        <option key={task.id} disabled>
          {task.title}
        </option>
      );
      selectOptions.push(taskOption);

      task.taskItems.forEach(function (item) {
        const taskItemOption = (
          <option
            key={item.id}
            value={JSON.stringify({taskId: task.id, taskItemId: item.id})}
          >
            {item.title}
          </option>
        );
        selectOptions.push(taskItemOption);
      });
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      size="full"
      onClose={!isSubmitting ? closeModal : () => {}}
    >
      <ModalContent margin="0">
        <ModalBody padding="0">
          <Flex
            paddingY="3"
            paddingX="6"
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth="1px"
            borderBottomColor="gray.100"
            borderBottomStyle="solid"
          >
            <Flex alignItems="center">
              <CloseButton borderRadius="50%" onClick={onClose} />
              <Heading marginLeft="4" as="h3" fontSize="xl" color="gray.800">
                Buat Diskusi
              </Heading>
            </Flex>
            <Button
              colorScheme="green"
              isDisabled={isSubmitting}
              onClick={handleSubmit}
            >
              Buat
            </Button>
          </Flex>
          {(function () {
            if (!tasks && error) {
              return (
                <Flex justifyContent="center" alignItems="center">
                  <ErrorFallback
                    errorMessage="Upsss, Gagal memuat data"
                    onRetry={() => mutate(null)}
                  />
                </Flex>
              );
            }

            if (tasks) {
              return (
                <Box padding="6">
                  <FormControl id="task-name" isRequired>
                    <FormLabel>Judul</FormLabel>
                    <Input
                      onChange={e => setTitle(e.target.value)}
                      value={title}
                    />
                  </FormControl>
                  <FormControl id="task-item" marginTop="6" isRequired>
                    <FormLabel>Tugas yang ditanyakan</FormLabel>
                    <Select
                      value={selectedTask}
                      onChange={e => setSelectedTask(e.target.value)}
                    >
                      {selectOptions}
                    </Select>
                  </FormControl>
                  <FormLabel
                    marginTop="6"
                    onClick={() => mdRef.current.textarea.focus()}
                  >
                    Deskripsi
                  </FormLabel>
                  <MDEditor
                    ref={ref => (mdRef.current = ref)}
                    value={description}
                    onChange={setDescription}
                  />
                </Box>
              );
            }

            if (!tasks && !error) {
              return (
                <Flex justifyContent="center" alignItems="center">
                  <Loader />
                </Flex>
              );
            }
          })()}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
