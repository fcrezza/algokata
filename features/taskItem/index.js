import React from "react";
import NextLink from "next/link";
import {Box, Container, Flex, Heading, Text} from "@chakra-ui/layout";
import ReactMarkdown from "react-markdown";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {Button} from "@chakra-ui/button";
import {
  Code,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  UnorderedList,
  ListItem,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Icon,
  useToast
} from "@chakra-ui/react";
import {css} from "@emotion/react";
import dynamic from "next/dynamic";
import {ghcolors} from "react-syntax-highlighter/dist/cjs/styles/prism";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/eclipse.css";
import useSWR from "swr";
import {useRouter} from "next/router";
import axios from "axios";

import {Loader} from "components/Loader";
import ErrorFallback from "features/cls/ErrorFallback";
import Head from "components/Head";
import {MdCheckCircle} from "react-icons/md";

const CodeMirror = dynamic(
  () => import("react-codemirror2").then(mod => mod.Controlled),
  {
    ssr: false
  }
);

const isInBrowser =
  typeof window !== "undefined" && typeof window.navigator !== "undefined";

if (isInBrowser) {
  require("codemirror/mode/javascript/javascript");
}

const components = {
  code({inline, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || "");
    return !inline && match ? (
      <SyntaxHighlighter
        style={ghcolors}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    ) : (
      <Code className={className}>{children}</Code>
    );
  },
  p: ({children}) => {
    return (
      <Text marginBottom={3} color="gray.600">
        {children}
      </Text>
    );
  },

  h3({children}) {
    return (
      <Heading as="h3" fontSize="xl" marginBottom={3} color="gray.800">
        {children}
      </Heading>
    );
  }
};

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
              <Head title={`${itemData.title} - {itemData.task.title}`} />
              <ResetEditorDialog
                onClose={onDialogClose}
                isOpen={isDialogOpen}
                onConfirmation={() => {
                  setSolutionCode("");
                  onDialogClose();
                }}
              />
              <ValidationResultModal
                result={validationResult}
                onClose={() => setValidationResult(null)}
                onSave={saveAnswer}
              />
              <Flex overflow="hidden">
                <Box
                  width="50%"
                  height="calc(100vh - 75px)"
                  overflowY="auto"
                  padding="6"
                >
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
                  <Heading as="h3" color="gray.800" fontSize="3xl">
                    {itemData.title}{" "}
                    {itemData.isDone ? (
                      <Icon
                        as={MdCheckCircle}
                        color={"green.600"}
                        boxSize="7"
                      />
                    ) : null}
                  </Heading>
                  <Box marginY="4">
                    <ReactMarkdown components={components}>
                      {itemData.description}
                    </ReactMarkdown>
                  </Box>
                  <ActionButton onClick={handleRun}>Jalankan Kode</ActionButton>
                  <ActionButton onClick={onDialogOpen}>
                    Reset Kode Editor
                  </ActionButton>
                  <ActionButton>Dapatkan Bantuan</ActionButton>
                </Box>
                <Box height="calc(100vh - 75px)" width="50%">
                  <Box
                    css={css`
                      height: 70%;

                      .react-codemirror2 {
                        height: 100%;
                      }
                    `}
                  >
                    <CodeMirror
                      value={
                        solutionCode.length === 0
                          ? itemData.solutionCode
                          : solutionCode
                      }
                      onBeforeChange={(editor, data, value) =>
                        setSolutionCode(value)
                      }
                      editorDidMount={editor => editor.setSize("100%", "100%")}
                      options={{
                        theme: "eclipse",
                        lineNumbers: true,
                        showCursorWhenSelecting: true,
                        lineWrapping: true,
                        autoFocus: true
                      }}
                    />
                  </Box>
                  <Divider />
                  <Box
                    css={css`
                      height: 30%;

                      .react-codemirror2 {
                        height: 100%;
                      }
                    `}
                  >
                    <CodeMirror
                      value={itemData.testCode}
                      editorDidMount={editor => editor.setSize("100%", "100%")}
                      options={{
                        theme: "eclipse",
                        lineNumbers: true,
                        showCursorWhenSelecting: true,
                        lineWrapping: true,
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

function ValidationResultModal({result, onClose, onSave}) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  let buttonText = "";
  let modalTitle = "";
  let onClickCallback = onClose;
  const onCloseCallback = isSubmitting ? () => {} : onClose;
  let listItems = [];

  if (result) {
    if (result.stats.failures === 0) {
      buttonText = "Simpan Dan Lanjut Ke Item Berikutnya";
      modalTitle = "Horee, berhasil";
      onClickCallback = async () => {
        setIsSubmitting(true);
        await onSave();
        setIsSubmitting(false);
      };
    } else {
      buttonText = "Kembali";
      modalTitle = "Upzzz, masih ada yang salah";
    }

    listItems = result.result.map(r => {
      const {id, title, state, error, type} = r;

      if (type === "test") {
        const itemColor = state === "passed" ? "green.400" : "red.400";
        let errorMessage = null;

        if (state === "failed") {
          errorMessage = (
            <Text fontSize="sm" color="gray.600">
              Error: {error}
            </Text>
          );
        }

        return (
          <ListItem key={id} color={itemColor}>
            {title}
            {errorMessage}
          </ListItem>
        );
      }
    });
  }

  return (
    <Modal isOpen={result !== null} onClose={onCloseCallback}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{modalTitle}</ModalHeader>
        <ModalCloseButton disabled={isSubmitting} />
        <ModalBody>
          <UnorderedList>{listItems}</UnorderedList>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            marginRight={3}
            onClick={onClickCallback}
            disabled={isSubmitting}
            isFullWidth
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function ResetEditorDialog({isOpen, onConfirmation, onClose}) {
  const cancelRef = React.useRef();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Reset Editor
          </AlertDialogHeader>
          <AlertDialogBody>
            Apakah kamu yakin ingin mereset kode editor?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Batal
            </Button>
            <Button colorScheme="red" onClick={onConfirmation} ml={3}>
              Reset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

function ActionButton({children, onClick}) {
  return (
    <Button
      variant="outline"
      colorScheme="green"
      size="lg"
      marginBottom="3"
      onClick={onClick}
      isFullWidth
    >
      {children}
    </Button>
  );
}
