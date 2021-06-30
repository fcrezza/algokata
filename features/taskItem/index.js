import React from "react";
import Head from "next/head";
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
  useDisclosure
} from "@chakra-ui/react";
import {css} from "@emotion/react";
import dynamic from "next/dynamic";
import {ghcolors} from "react-syntax-highlighter/dist/cjs/styles/prism";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/eclipse.css";
import useSWR from "swr";
import {useRouter} from "next/router";

import {Loader} from "components/Loader";
import ErrorFallback from "features/cls/ErrorFallback";

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
  const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}/${router.query.tiid}`;
  const {data: itemData, error, mutate} = useSWR(url);
  const [solutionCode, setSolutionCode] = React.useState("");
  const [validationResult, setValidationResult] = React.useState(null);
  const {
    isOpen: isDialogOpen,
    onClose: onDialogClose,
    onOpen: onDialogOpen
  } = useDisclosure();
  const iframeRef = React.useRef();

  const handleRun = () => {
    iframeRef.current.contentWindow.postMessage(
      `${solutionCode}\n\n${itemData.testCode}`,
      process.env.NEXT_PUBLIC_IFRAME_ORIGIN
    );
  };

  React.useEffect(() => {
    // TODO: handle when error? to prevent submitting state always true
    const messageHandler = ({data, origin}) => {
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
              <Head title="." />
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
                    {itemData.title}
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

function ValidationResultModal({result, onClose}) {
  return (
    <Modal isOpen={result !== null} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {result?.stats?.failures === 0
            ? "Horee, berhasil!"
            : "Upzzz, masih ada yang salah"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <UnorderedList>
            {result?.result.map(r => {
              if (r.type === "test") {
                return (
                  <ListItem
                    key={r.id}
                    color={r.state === "passed" ? "green.400" : "red.400"}
                  >
                    {r.title}
                    {r.state === "failed" ? (
                      <Text fontSize="sm" color="gray.600">
                        Error: {r.error}
                      </Text>
                    ) : null}
                  </ListItem>
                );
              }
            })}
          </UnorderedList>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            marginRight={3}
            onClick={onClose}
            isFullWidth
          >
            {result?.stats?.failures === 0
              ? "Lanjut Ke Tugas Berikutnya"
              : "Coba Lagi"}
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
