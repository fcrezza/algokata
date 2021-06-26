import {
  Button,
  CloseButton,
  Container,
  Flex,
  Heading,
  Icon,
  LinkBox,
  LinkOverlay,
  Modal,
  ModalBody,
  ModalHeader,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  UnorderedList,
  ListItem,
  Stack,
  Text,
  Box,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useDisclosure,
  Divider,
  ButtonGroup,
  ModalOverlay
} from "@chakra-ui/react";
import NextLink from "next/link";
import {MdAdd, MdCheckCircle} from "react-icons/md";
import {VscCircleOutline} from "react-icons/vsc";
import axios from "axios";
import * as React from "react";
import {useRouter} from "next/router";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/dist/markdown-editor.css";
import "@uiw/react-markdown-preview/dist/markdown.css";
import "codemirror/theme/eclipse.css";
import "codemirror/lib/codemirror.css";
import {css} from "@emotion/react";
import dynamic from "next/dynamic";
import {withProtectedRoute} from "utils/routes";

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

function TaskPage() {
  const {isOpen, onClose, onOpen} = useDisclosure();

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="800px"
    >
      <ChallengeCreatorModal isOpen={isOpen} onClose={onClose} />
      <Text color="gray.600" fontSize="sm" marginBottom="3">
        23 Juni 2021
      </Text>
      <Heading color="gray.800" marginBottom="5">
        Pertemuan 1: Tipe data dan variabel
      </Heading>
      <Text color="gray.600" fontSize="lg">
        Pertemuan 1 kali ini membahas mengenai macam-macam tipe data dan
        bagaimana cara melakukan pendefinisian variabel. Setelah mempraktekan
        pertemuan kali ini diharapkan mahasiswa dapat mengetahui macam-macam
        tipe data dan bagaimana mendefinisikan variabel.
      </Text>
      <Stack marginTop="10" spacing="4">
        <TaskItem title="Deklarasi variabel" isDone />
        <TaskItem title="Tipe data number" isDone />
        <TaskItem title="Tipe data String" />
        <TaskItem title="Tipe data boolean" />
        <Button colorScheme="green" onClick={onOpen}>
          <MdAdd size="24" />
        </Button>
      </Stack>
    </Container>
  );
}

function TaskItem({title, isDone}) {
  return (
    <LinkBox
      backgroundColor="gray.100"
      borderRadius="lg"
      _hover={{
        backgroundColor: "gray.200"
      }}
    >
      <NextLink href={"#"} passHref>
        <LinkOverlay>
          <Flex
            paddingLeft="2"
            paddingRight="6"
            paddingY="3"
            alignItems="center"
            justifyContent="space-between"
            color="gray.800"
          >
            <Text
              textDecoration="none"
              marginLeft="2"
              fontWeight="bold"
              fontSize="lg"
            >
              {title}
            </Text>
            <Icon
              as={isDone ? MdCheckCircle : VscCircleOutline}
              color={isDone ? "green.600" : "gray.500"}
              boxSize="6"
            />
          </Flex>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
}

function ChallengeCreatorModal({isOpen, onClose}) {
  const [title, setTitle] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [testCode, setTestCode] = React.useState("");
  const [solutionCode, setSolutionCode] = React.useState("");
  // const [isSubmitting, setSubmitState] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const toast = useToast();
  const iframeRef = React.useRef();
  const [result, setResult] = React.useState(null);

  const closeModal = () => {
    setTitle("");
    setMessage("");
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await axios.post(`/api/classes/${router.query.cid}/announcements`, {
        title,
        message
      });
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
    // setSubmitState(true);
    iframeRef.current.contentWindow.postMessage(
      `${solutionCode}\n\n${testCode}`,
      process.env.NEXT_PUBLIC_IFRAME_ORIGIN
    );
  };

  React.useEffect(() => {
    // TODO: handle when error? to prevent submitting state always true
    const messageHandler = ({data, origin}) => {
      if (origin === process.env.NEXT_PUBLIC_IFRAME_ORIGIN) {
        console.log(data);
        // setSubmitState(false);
        setResult(data);
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
          <Modal isOpen={result !== null} onClose={() => setResult(null)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Hasil Test</ModalHeader>
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
                  onClick={() => setResult(null)}
                  isFullWidth
                >
                  Kembali
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
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
            <Button colorScheme="green" onClick={handleSubmit}>
              Buat
            </Button>
          </Flex>
          <Box padding="6">
            <FormControl id="task-name">
              <FormLabel>Judul</FormLabel>
              <Input onChange={e => setTitle(e.target.value)} value={title} />
            </FormControl>
            <FormLabel id="task-description" marginTop="6">
              Deskripsi
            </FormLabel>
            <MDEditor
              enableScroll={false}
              textareaProps={{id: "task-description"}}
            />
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
        <ButtonGroup variant="ghost">
          <Button>Solusi</Button>
          <Button>Bantuan</Button>
        </ButtonGroup>
      </Flex>
      <CodeMirror
        onBeforeChange={(editor, data, value) => onChange(value)}
        value={value}
        editorDidMount={editor => editor.setSize("100%", "100%")}
        options={{
          theme: "eclipse",
          lineNumbers: true,
          showCursorWhenSelecting: true,
          lineWrapping: true,
          autofocus: true
        }}
      />
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
        <ButtonGroup variant="ghost">
          <Button>Test Cases</Button>
          <Button
            backgroundColor="#f7f7f7"
            borderColor="gray.200"
            borderStyle="solid"
            borderWidth="1px 1px 1px 0"
            color="gray.600"
            paddingX="4"
            paddingY="2"
          >
            Bantuan
          </Button>
        </ButtonGroup>
      </Flex>
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
    </Box>
  );
}

export default withProtectedRoute(TaskPage);
