import * as React from "react";
import axios from "axios";
import {useRouter} from "next/router";
import MDEditor from "@uiw/react-md-editor";
import dynamic from "next/dynamic";
// disable lint because `jsx` never used and only used for emotion
// eslint-disable-next-line
import {css, jsx} from "@emotion/react";
import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  UnorderedList,
  ListItem,
  CloseButton,
  Box,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Divider,
  ButtonGroup,
  ModalOverlay,
  Text,
  Button,
  Flex,
  Heading
} from "@chakra-ui/react";
import "@uiw/react-md-editor/dist/markdown-editor.css";
import "@uiw/react-markdown-preview/dist/markdown.css";
import "codemirror/theme/eclipse.css";
import "codemirror/lib/codemirror.css";
import {mutate} from "swr";

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

const solutionExample = `function sum(a, b) {
  return a + b
}
`;
const testCasesExample = `it('1 + 1 sama dengan 2', () => {
  assert.equal(sum(1, 1), 2)
})

it('10 + 20 sama dengan 30', () => {
  assert.equal(sum(10, 20), 30)
})
`;

export default function TaskItemModal({isOpen, onClose}) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [testCode, setTestCode] = React.useState("");
  const [solutionCode, setSolutionCode] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState(null);
  const router = useRouter();
  const toast = useToast();
  const iframeRef = React.useRef();

  const closeModal = () => {
    setTitle("");
    setDescription("");
    setTestCode("");
    setSolutionCode("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const url = `/api/classes/${router.query.cid}/activities/${router.query.tid}`;
      setIsSubmitting(true);
      await axios.post(url, {
        title,
        description,
        solutionCode,
        testCode
      });
      await mutate(url);
      setIsSubmitting(false);
      closeModal();
    } catch (error) {
      setIsSubmitting(false);
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
  };

  const insertExample = () => {
    setSolutionCode(solutionExample);
    setTestCode(testCasesExample);
  };

  const handleRun = () => {
    iframeRef.current.contentWindow.postMessage(
      `${solutionCode}\n\n${testCode}`,
      process.env.NEXT_PUBLIC_IFRAME_ORIGIN
    );
  };

  React.useEffect(() => {
    const messageHandler = ({data, origin}) => {
      if (origin === process.env.NEXT_PUBLIC_IFRAME_ORIGIN) {
        setValidationResult(data);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => window.removeEventListener("message", messageHandler);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      size="full"
      onClose={!isSubmitting ? closeModal : () => {}}
    >
      <ModalContent margin="0">
        <ModalBody padding="0">
          <ValidationResultModal
            isOpen={validationResult !== null}
            onClose={() => setValidationResult(null)}
          >
            <UnorderedList>
              {validationResult?.result.map(r => {
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
          </ValidationResultModal>
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
                Buat Soal
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
          <Box padding="6">
            <FormControl id="task-name">
              <FormLabel>Judul</FormLabel>
              <Input onChange={e => setTitle(e.target.value)} value={title} />
            </FormControl>
            {/* TODO: make description editor focus when label clicked */}
            <FormLabel marginTop="6">Deskripsi</FormLabel>
            <MDEditor value={description} onChange={setDescription} />
            <ButtonGroup variant="outline" spacing="3" marginTop="6">
              <Button colorScheme="green" onClick={handleRun}>
                Validasi Kode
              </Button>
              <Button onClick={insertExample}>Sisipkan Contoh</Button>
            </ButtonGroup>
            <Flex marginTop="6">
              <Solution
                value={solutionCode}
                onChange={v => setSolutionCode(v)}
              />
              <Divider orientation="vertical" />
              <TestCase value={testCode} onChange={setTestCode} />
            </Flex>
          </Box>
          <iframe
            src={process.env.NEXT_PUBLIC_IFRAME_ORIGIN}
            title="runner"
            ref={iframeRef}
            style={{display: "none"}}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function Solution({value, onChange}) {
  return (
    <Box
      width="50%"
      overflow="hidden"
      css={css`
        .react-codemirror2 {
          height: 400px;
          border-color: #ddd;
          border-width: 0 0 1px 1px;
          border-style: solid;
        }
      `}
    >
      <Flex
        backgroundColor="#f7f7f7"
        borderColor="gray.200"
        borderStyle="solid"
        borderWidth="1px"
      >
        <EditorButton isActive>Solusi</EditorButton>
        <EditorButton>Bantuan</EditorButton>
      </Flex>
      <CodeEditor value={value} onChange={onChange} />
    </Box>
  );
}

function TestCase({value, onChange}) {
  return (
    <Box
      width="50%"
      overflow="hidden"
      css={css`
        .react-codemirror2 {
          height: 400px;
          border-color: #ddd;
          border-width: 0 1px 1px 0;
          border-style: solid;
        }
      `}
    >
      <Flex
        backgroundColor="#f7f7f7"
        borderColor="gray.200"
        borderStyle="solid"
        borderWidth="1px 1px 1px 0"
      >
        <EditorButton>Test Cases</EditorButton>
        <EditorButton>Bantuan</EditorButton>
      </Flex>
      <CodeEditor value={value} onChange={onChange} />
    </Box>
  );
}

function EditorButton({children, onClick, isActive}) {
  return (
    <button
      css={css`
        border: 0;
        padding: 0.4rem 0.8rem;
        color: #333;
        font-size: 1rem;
        font-weight: 500;
        background-color: ${isActive ? "#ddd" : "transparent"};

        &:not(:last-child) {
          border-right: 1px solid #ddd;
        }

        &:hover,
        &:focus {
          background-color: #ddd;
        }
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CodeEditor({value, onChange}) {
  return (
    <CodeMirror
      onBeforeChange={(editor, data, value) => onChange(value)}
      value={value}
      editorDidMount={editor => editor.setSize("100%", "100%")}
      options={{
        theme: "eclipse",
        lineNumbers: true,
        showCursorWhenSelecting: true,
        lineWrapping: true
      }}
    />
  );
}

function ValidationResultModal({isOpen, onClose, children}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Hasil Test</ModalHeader>
        <ModalCloseButton borderRadius="50%" />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button
            colorScheme="green"
            marginRight={3}
            onClick={onClose}
            isFullWidth
          >
            Kembali
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
