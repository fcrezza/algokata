import * as React from "react";
import MDEditor from "@uiw/react-md-editor";
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
  Heading,
  useDisclosure
} from "@chakra-ui/react";
import "@uiw/react-md-editor/dist/markdown-editor.css";
import "@uiw/react-markdown-preview/dist/markdown.css";

import CodeEditor from "components/CodeEditor";
import ConfirmationPrompt from "components/ConfirmationPrompt";

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

export default function TaskItemModal(props) {
  const {
    isOpen,
    onClose,
    defaultValues,
    handleDeleteItem,
    handleCreateItem,
    handleSaveChanges
  } = props;
  const {
    title: defaultTitle,
    description: defaultDescription,
    solutionCode: defaultSolutionCode,
    testCode: defaultTestCode
  } = defaultValues;
  const isEdit = Object.keys(defaultValues).length > 0;
  const [title, setTitle] = React.useState(defaultTitle || "");
  const [description, setDescription] = React.useState(
    defaultDescription || ""
  );
  const [testCode, setTestCode] = React.useState(defaultTestCode || "");
  const [solutionCode, setSolutionCode] = React.useState(
    defaultSolutionCode || ""
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [validationResult, setValidationResult] = React.useState(null);
  const {
    onOpen: onOpenPrompt,
    onClose: onClosePrompt,
    isOpen: isPromptOpen
  } = useDisclosure();
  const toast = useToast();
  const iframeRef = React.useRef();

  async function onCreate() {
    try {
      setIsSubmitting(true);
      await handleCreateItem({title, description, solutionCode, testCode});
      setIsSubmitting(false);
      toast({
        status: "success",
        title: `Item berhasil ditambahkan`,
        isClosable: true
      });
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
  }

  async function onSaveChanges() {
    try {
      setIsSubmitting(true);
      await handleSaveChanges({title, description, solutionCode, testCode});
      setIsSubmitting(false);
      toast({
        status: "success",
        title: `Perubahan berhasil disimpan`,
        isClosable: true
      });
      onClose();
    } catch (error) {
      setIsSubmitting(false);
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
  }

  async function onDelete() {
    await handleDeleteItem();
    onClose();
  }

  function insertExample() {
    setSolutionCode(solutionExample);
    setTestCode(testCasesExample);
  }

  function handleRun() {
    iframeRef.current.contentWindow.postMessage(
      `${solutionCode}\n\n${testCode}`,
      process.env.NEXT_PUBLIC_IFRAME_ORIGIN
    );
  }

  React.useEffect(() => {
    function messageHandler({data, origin}) {
      if (origin === process.env.NEXT_PUBLIC_IFRAME_ORIGIN) {
        setValidationResult(data);
      }
    }

    window.addEventListener("message", messageHandler);

    return () => window.removeEventListener("message", messageHandler);
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      size="full"
      onClose={!isSubmitting ? onClose : () => {}}
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
          <ConfirmationPrompt
            isOpen={isPromptOpen}
            onClose={onClosePrompt}
            title="Hapus item"
            actionTitle="Hapus"
            description="Yakin ingin menghapus item?"
            successMessage="Item berhasil dihapus"
            errorMessage="Operasi gagal dilakukan"
            onConfirmation={onDelete}
          />
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
              <CloseButton
                borderRadius="50%"
                onClick={onClose}
                isDisabled={isSubmitting}
              />
              <Heading marginLeft="4" as="h3" fontSize="xl" color="gray.800">
                {isEdit ? "Edit Soal" : "Buat Soal"}
              </Heading>
            </Flex>
            <ButtonGroup isDisabled={isSubmitting}>
              {isEdit ? (
                <Button
                  colorScheme="red"
                  variant="ghost"
                  onClick={onOpenPrompt}
                >
                  Hapus
                </Button>
              ) : null}
              <Button
                colorScheme="green"
                onClick={isEdit ? onSaveChanges : onCreate}
              >
                {isEdit ? "Simpan" : "Buat"}
              </Button>
            </ButtonGroup>
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
      height="400px"
      borderColor="gray.200"
      borderWidth="0 0 1px 1px"
      borderStyle="solid"
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
      height="400px"
      borderColor="gray.200"
      borderWidth="0 1px 1px 0"
      borderStyle="solid"
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
