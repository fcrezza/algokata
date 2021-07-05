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
  Icon,
  useToast
} from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/dist/markdown.css";

import {Loader} from "components/Loader";
import Head from "components/Head";
import CodeEditor from "components/CodeEditor";
import ErrorFallback from "./ErrorFallback";
import ActionButton from "./ActionButton";
import ResetEditorDialog from "./ResetEditorDialog";
import ValidationResultModal from "./ValidationResultModal";

export default function TaskItem() {
  const router = useRouter();
  const {cid: classId, tid: taskId, tiid: taskItemId} = router.query;
  const url = `/api/classes/${classId}/activities/${taskId}/${taskItemId}`;
  const {data: itemData, error, mutate} = useSWR(url);
  const [solutionCode, setSolutionCode] = React.useState("");
  const [validationResult, setValidationResult] = React.useState(null);
  const {
    isOpen: isDialogOpen,
    onClose: onDialogClose,
    onOpen: onDialogOpen
  } = useDisclosure();
  const iframeRef = React.useRef();
  const toast = useToast();

  const handleConfirmDialog = () => {
    setSolutionCode("");
    onDialogClose();
  };

  const handleRun = () => {
    iframeRef.current.contentWindow.postMessage(
      `${solutionCode}\n\n${itemData.testCode}`,
      process.env.NEXT_PUBLIC_IFRAME_ORIGIN
    );
  };

  const saveAnswer = async () => {
    try {
      const url = `/api/classes/${classId}/activities/${taskId}/answers`;
      const requestBody = {
        solutionCode,
        taskItemId
      };
      await axios.post(url, requestBody);
      setSolutionCode("");
      setValidationResult(null);
      if (itemData.next !== null) {
        router.push(`/c/${classId}/${taskId}/${itemData.next.id}`);
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
        if (!itemData && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (itemData) {
          return (
            <React.Fragment>
              <Head title={`${itemData.title} - ${itemData.task.title}`} />
              <ResetEditorDialog
                onClose={onDialogClose}
                isOpen={isDialogOpen}
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
                          {itemData.class.name}
                        </BreadcrumbLink>
                      </NextLink>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                      <NextLink
                        href={`/c/${router.query.cid}/${router.query.tid}`}
                        passHref
                      >
                        <BreadcrumbLink color="green.500">
                          {itemData.task.title}
                        </BreadcrumbLink>
                      </NextLink>
                    </BreadcrumbItem>
                  </Breadcrumb>
                  <Flex alignItems="center">
                    <Heading as="h3" color="gray.800" fontSize="3xl">
                      {itemData.title}
                    </Heading>
                    {itemData.isDone ? (
                      <Icon
                        as={MdCheckCircle}
                        color={"green.600"}
                        boxSize="7"
                        marginLeft="2"
                      />
                    ) : null}
                  </Flex>
                  <Box marginY="4">
                    <MDEditor.Markdown source={itemData.description} />
                  </Box>
                  <ActionButton onClick={handleRun}>Jalankan Kode</ActionButton>
                  <ActionButton onClick={onDialogOpen}>
                    Reset Kode Editor
                  </ActionButton>
                  <ActionButton>Dapatkan Bantuan</ActionButton>
                </Box>
                <Box width="50%">
                  <Box height="70%">
                    <CodeEditor
                      value={
                        solutionCode.length === 0
                          ? itemData.solutionCode
                          : solutionCode
                      }
                      onChange={setSolutionCode}
                      options={{autoFocus: true}}
                    />
                  </Box>
                  <Divider />
                  <Box height="30%">
                    <CodeEditor
                      value={itemData.testCode}
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

        if (!itemData && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}
