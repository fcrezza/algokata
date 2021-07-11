import React from "react";
import NextLink from "next/link";
import useSWR from "swr";
import axios from "axios";
import {useRouter} from "next/router";
import {MdCheckCircle} from "react-icons/md";
import {Box, Container, Flex, Heading} from "@chakra-ui/layout";
import {
  Divider,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useDisclosure,
  Text,
  Icon,
  useToast
} from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/dist/markdown.css";

import {Loader} from "components/Loader";
import Head from "components/Head";
import CodeEditor from "components/CodeEditor";
import ErrorFallback from "components/ErrorFallback";
import ActionButton from "./ActionButton";
import ResetEditorDialog from "./ResetEditorDialog";
import ValidationResultModal from "./ValidationResultModal";
import {useAuth} from "utils/auth";

function fetcher(taskItemUrl, taskAnswersUrl) {
  const taskItem = axios.get(taskItemUrl);
  const taskAnswers = axios.get(taskAnswersUrl);
  return Promise.all([taskItem, taskAnswers]).then(res => res.map(r => r.data));
}

export default function TaskItem() {
  const router = useRouter();
  const {user} = useAuth();
  const {cid: classId, tid: taskId, tiid: taskItemId} = router.query;
  const {data, error, mutate} = useSWR(
    [
      `/api/classes/${classId}/activities/${taskId}/items?itemId=${taskItemId}`,
      `/api/classes/${classId}/activities/${taskId}/answers?userId=${user.id}`
    ],
    fetcher
  );
  const [solutionCode, setSolutionCode] = React.useState("");
  const [validationResult, setValidationResult] = React.useState(null);
  const {isOpen, onClose, onOpen} = useDisclosure();
  const toast = useToast();
  const iframeRef = React.useRef();

  const handleConfirmDialog = () => {
    setSolutionCode("");
    onClose();
  };

  const handleRun = () => {
    const [taskItem] = data;
    iframeRef.current.contentWindow.postMessage(
      `${solutionCode}\n\n${taskItem.testCode}`,
      process.env.NEXT_PUBLIC_IFRAME_ORIGIN
    );
  };

  const saveAnswer = async () => {
    try {
      const [taskItem] = data;
      const url = `/api/classes/${classId}/activities/${taskId}/answers`;
      const requestBody = {
        solutionCode,
        taskItemId
      };
      await axios.post(url, requestBody);
      setSolutionCode("");
      setValidationResult(null);
      if (taskItem.next !== null) {
        router.push(`/c/${classId}/${taskId}/${taskItem.next.id}`);
      } else {
        router.push(`/c/${classId}/${taskId}`);
      }
    } catch (error) {
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
  };

  React.useEffect(() => {
    const messageHandler = async ({data, origin}) => {
      if (origin === process.env.NEXT_PUBLIC_IFRAME_ORIGIN) {
        setValidationResult(data);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => window.removeEventListener("message", messageHandler);
  }, []);

  return (
    <Container padding="0" maxWidth="full">
      {(() => {
        if (!data && error) {
          if (error.response && error.response.data.error.code === 404) {
            return (
              <Text marginTop="8" color="gray.600" textAlign="center">
                {error.response.data.error.message}
              </Text>
            );
          }

          return (
            <Box marginTop="8">
              <ErrorFallback
                errorMessage="Upsss, Gagal memuat data"
                onRetry={() => mutate(null)}
              />
            </Box>
          );
        }

        if (data) {
          const [taskItem, taskAnswers] = data;
          const isDone = taskAnswers.find(a => a.taskItem.id === taskItem.id);
          return (
            <React.Fragment>
              <Head title={`${taskItem.title} - ${taskItem.task.title}`} />
              <ResetEditorDialog
                onClose={onClose}
                isOpen={isOpen}
                onConfirmation={handleConfirmDialog}
              />
              <ValidationResultModal
                result={validationResult}
                onClose={() => setValidationResult(null)}
                onSave={saveAnswer}
              />
              <Flex overflow="hidden" height="calc(100vh - 70px)">
                <Box width="50%" overflowY="auto" padding="6">
                  <Breadcrumb marginBottom="4">
                    <BreadcrumbItem>
                      <NextLink href={`/c/${router.query.cid}`} passHref>
                        <BreadcrumbLink color="green.500">
                          {taskItem.class.name}
                        </BreadcrumbLink>
                      </NextLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <NextLink
                        href={`/c/${router.query.cid}/${router.query.tid}`}
                        passHref
                      >
                        <BreadcrumbLink color="green.500">
                          {taskItem.task.title}
                        </BreadcrumbLink>
                      </NextLink>
                    </BreadcrumbItem>
                  </Breadcrumb>
                  <Flex alignItems="center">
                    <Heading as="h3" color="gray.800" fontSize="3xl">
                      {taskItem.title}
                    </Heading>
                    {isDone ? (
                      <Icon
                        as={MdCheckCircle}
                        color={"green.600"}
                        boxSize="7"
                        marginLeft="2"
                      />
                    ) : null}
                  </Flex>
                  <Box marginY="4">
                    <MDEditor.Markdown source={taskItem.description} />
                  </Box>
                  <ActionButton onClick={handleRun}>Jalankan Kode</ActionButton>
                  <ActionButton onClick={onOpen}>
                    Reset Kode Editor
                  </ActionButton>
                  <ActionButton
                    as="a"
                    href={`/d/${classId}/?taskItem=${taskItemId}`}
                    target="_blank"
                  >
                    Dapatkan Bantuan
                  </ActionButton>
                </Box>
                <Box width="50%">
                  <Box height="70%">
                    <CodeEditor
                      value={
                        solutionCode.length === 0
                          ? taskItem.solutionCode
                          : solutionCode
                      }
                      onChange={setSolutionCode}
                      options={{autoFocus: true}}
                    />
                  </Box>
                  <Divider />
                  <Box height="30%">
                    <CodeEditor
                      value={taskItem.testCode}
                      options={{
                        readOnly: "nocursor"
                      }}
                    />
                  </Box>
                </Box>
              </Flex>
              <iframe
                src={process.env.NEXT_PUBLIC_IFRAME_ORIGIN}
                title="runner"
                ref={iframeRef}
                style={{display: "none"}}
              />
            </React.Fragment>
          );
        }

        if (!data && !error) {
          return (
            <Box marginTop="8">
              <Loader />
            </Box>
          );
        }
      })()}
    </Container>
  );
}
