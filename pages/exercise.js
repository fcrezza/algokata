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
  AlertDialogOverlay
} from "@chakra-ui/react";
import {ghcolors} from "react-syntax-highlighter/dist/cjs/styles/prism";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/eclipse.css";
import {css} from "@emotion/react";
import dynamic from "next/dynamic";

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

const mkdown = `
Ketika kalian mendengar istilah variabel dalam pemrograman, bayangkan sebuah variabel merupakan ember yang dapat menyimpan nilai. Dalam bahasa pemrograman nilai ini bisa memiliki tipe seperti angka, string/text, function, array, object dan lain lain.

Potongan kode berikut merupakan cara mendefinisikan variabel dalam javascript:

~~~js
var angka = 1;
~~~

Pada contoh kode diatas kita membuat variabel bernama angka dengan keyword \`var\` dan menyimpan nilai 1 pada variabel tersebut.

### Giliran kamu!

Pada editor di sebelah kanan buat variabel dengan nama \`seratus\` dan simpan nilai 100 ke variabel tersebut.
`;

const testCode = `it('variabel seratus memiliki tipe data number', function() {
  assert.isNumber(seratus);
});

it('variabel seratus menyimpan nilai 100', function() {
  assert.equal(seratus, 100);
});
`;

export default function Exercise() {
  const [codeValue, setCodeValue] = React.useState("");
  const [result, setResult] = React.useState(null);
  const iframeRef = React.useRef();
  const [isSubmitting, setSubmitState] = React.useState(false);
  const [isClickReset, setClickReset] = React.useState(false);
  const cancelRef = React.useRef();

  const handleRun = () => {
    setSubmitState(true);
    iframeRef.current.contentWindow.postMessage(
      `${codeValue}\n\n${testCode}`,
      process.env.NEXT_PUBLIC_IFRAME_ORIGIN
    );
  };

  React.useEffect(() => {
    // TODO: handle when error? to prevent submitting state always true
    const messageHandler = ({data, origin}) => {
      if (origin === process.env.NEXT_PUBLIC_IFRAME_ORIGIN) {
        setSubmitState(false);
        setResult(data);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => window.removeEventListener("message", messageHandler);
  }, []);

  return (
    <Container padding="0" maxWidth="full">
      <Head>
        <title>Exercise - Dasar Javascript: Deklarasi Variabel</title>
      </Head>
      <AlertDialog
        isOpen={isClickReset}
        leastDestructiveRef={cancelRef}
        onClose={() => setClickReset(false)}
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
              <Button ref={cancelRef} onClick={() => setClickReset(false)}>
                Batal
              </Button>
              <Button
                colorScheme="green"
                onClick={() => {
                  setCodeValue("");
                  setClickReset(false);
                }}
                ml={3}
              >
                Reset
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Modal isOpen={result !== null} onClose={() => setResult(null)}>
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
              {result?.tests.map((test, idx) => (
                <ListItem
                  key={idx}
                  color={test.state === "passed" ? "green.400" : "red.400"}
                >
                  {test.title}
                </ListItem>
              ))}
            </UnorderedList>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              marginRight={3}
              onClick={() => setResult(null)}
              isFullWidth
            >
              {result?.stats?.failures === 0
                ? "Lanjut Ke Materi Berikutnya"
                : "Coba Lagi"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Flex overflow="hidden">
        <Box
          width="50%"
          height="calc(100vh - 75px)"
          overflowY="auto"
          padding="6"
        >
          <Breadcrumb marginBottom="4">
            <BreadcrumbItem>
              <NextLink href="#" passHref>
                <BreadcrumbLink color="green.500">
                  Pemrograman Dasar
                </BreadcrumbLink>
              </NextLink>
            </BreadcrumbItem>

            <BreadcrumbItem isCurrentPage>
              <NextLink href="#" passHref>
                <BreadcrumbLink color="green.500">
                  Dasar JavaScript: Deklarasi Variabel
                </BreadcrumbLink>
              </NextLink>
            </BreadcrumbItem>
          </Breadcrumb>
          <Heading as="h3" color="gray.800" fontSize="3xl">
            Dasar JavaScript: Deklarasi Variabel
          </Heading>
          <Box marginY="4">
            <ReactMarkdown components={components}>{mkdown}</ReactMarkdown>
          </Box>
          <Button
            variant="outline"
            colorScheme="green"
            size="lg"
            marginBottom="3"
            onClick={handleRun}
            isLoading={isSubmitting}
            loadingText="Menjalankan kode..."
            isDisabled={isSubmitting}
            isFullWidth
          >
            Jalankan Kode
          </Button>
          <Button
            variant="outline"
            colorScheme="green"
            size="lg"
            marginBottom="3"
            isFullWidth
            onClick={() => setClickReset(true)}
          >
            Reset Kode Editor
          </Button>
          <Button
            variant="outline"
            colorScheme="green"
            size="lg"
            marginBottom="3"
            isFullWidth
          >
            Dapatkan Bantuan
          </Button>
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
              onBeforeChange={(editor, data, value) => setCodeValue(value)}
              value={codeValue}
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
              value={testCode}
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
    </Container>
  );
}
