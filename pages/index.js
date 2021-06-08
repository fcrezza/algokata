import NextHead from "next/head";
import NextLink from "next/link";
import {Button} from "@chakra-ui/button";
import {
  Box,
  Center,
  Container,
  Flex,
  Grid,
  Heading,
  List,
  ListItem,
  Text
} from "@chakra-ui/layout";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Link
} from "@chakra-ui/react";

import Navigation from "components/Navigation";
import {Logo} from "components/Icons";
import {Discussion, Editor, Feedback, Manage} from "components/Illustrations";

export default function Home() {
  return (
    <>
      <Navigation />
      <Container marginTop="16" maxWidth="container.lg">
        <NextHead>
          <title>
            Algokata - Belajar pemrograman dan struktur data secara interaktif.
          </title>
        </NextHead>
        <Flex justifyContent="space-between" alignItems="center">
          <Box maxWidth="container.md" marginX="auto" textAlign="center">
            <Heading
              as="h1"
              color="gray.800"
              size="2xl"
              marginBottom="8"
              textTransform="capitalize"
              fontWeight="black"
              lineHeight="normal"
            >
              Belajar pemrograman dan struktur data secara interaktif.
            </Heading>
            <Text marginBottom="8" color="gray.600" fontSize="2xl">
              Bergabung dengan ribuan pengajar dan siswa lain, belajar
              pemrograman lebih menyenangkan dan menarik.
            </Text>
            <Button colorScheme="green" variant="outline" size="lg">
              Lanjutkan Dengan Google →
            </Button>
          </Box>
        </Flex>
      </Container>
      <Container marginTop="36" maxWidth="container.lg">
        <Heading
          as="h2"
          color="gray.800"
          textTransform="capitalize"
          fontWeight="bold"
          size="xl"
          marginBottom="14"
          textAlign="center"
        >
          Fitur utama
        </Heading>
        <Grid templateColumns="repeat(3, 1fr)" gap="4">
          <FeatureItem title="Realtime Editor" illustration={Editor} />
          <FeatureItem title="Manage Kelas" illustration={Manage} />
          <FeatureItem title="Forum Diskusi" illustration={Discussion} />
          <FeatureItem title="Interaktif Feedback" illustration={Feedback} />
        </Grid>
      </Container>
      <Container maxWidth="container.md">
        <Box marginTop="36" marginX="auto" textAlign="center">
          <Heading
            as="h2"
            color="gray.800"
            textTransform="capitalize"
            fontWeight="bold"
            size="xl"
            marginBottom="14"
          >
            Frequently Asked Question (FAQ)
          </Heading>
          <Accordion defaultIndex={[0]} allowMultiple>
            <FAQItem
              question="Apakah menggunakan Algokata dikenakan biaya?"
              answer="Aplikasi Algokata tidak memungut biaya sepeserpun dari pengguna"
            />
            <FAQItem
              question="Apakah Aplikasi ini dapat digunakan sebagai pengumpulan tugas?"
              answer="Aplikasi Algokata dapat digunakan sebagai platform pembelajaran maupun sebagai platform yang digunakan untuk kebutuhan tugas. Nantinya pengajar dapat memberikan soal melalui platform ini dan siswa dapat menuliskan kode langsung pada editor yang disediakan."
            />
          </Accordion>
        </Box>
      </Container>
      <Footer />
    </>
  );
}

function FeatureItem({title, illustration: Illustration}) {
  return (
    <Box
      borderRadius="xl"
      borderWidth="2px"
      borderColor="gray.300"
      borderStyle="solid"
      padding="8"
    >
      <Heading
        as="h3"
        fontSize="2xl"
        color="gray.700"
        textAlign="center"
        marginBottom="10"
      >
        {title}
      </Heading>
      <Center>
        <Illustration width="200" />
      </Center>
    </Box>
  );
}

function FAQItem({question, answer}) {
  return (
    <AccordionItem>
      <AccordionButton>
        <Box
          flex="1"
          textAlign="left"
          fontSize="lg"
          fontWeight="semibold"
          color="gray.700"
        >
          {question}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4} textAlign="left" color="gray.600">
        {answer}
      </AccordionPanel>
    </AccordionItem>
  );
}

function Footer() {
  return (
    <Container
      paddingY="12"
      marginTop="20"
      maxWidth="container.lg"
      borderTopStyle="solid"
      borderTopColor="gray.200"
      borderTopWidth="thin"
    >
      <Flex>
        <Box maxWidth="xs" marginRight="24">
          <NextLink href="/" passHref>
            <Link>
              <Flex alignItems="center">
                <Logo width="35" height="35" />
                <Text
                  marginLeft="2"
                  fontWeight="bold"
                  fontSize="xl"
                  fontFamily="mono"
                >
                  algokata
                </Text>
              </Flex>
            </Link>
          </NextLink>
          <Text color="gray.600" marginTop="3">
            Platform pembelajaran interaktif pemrograman dan struktur data
            algoritma.
          </Text>
          <Text color="gray.600" marginTop="3">
            © {new Date().getFullYear()} Algokata.
          </Text>
        </Box>
        <Box maxWidth="xs" marginRight="16">
          <Heading as="h3" color="hray.800" size="md">
            Services
          </Heading>
          <List marginTop="4" spacing="2">
            <ListItem>
              <Link color="gray.600">Feedback</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Bantuan</Link>
            </ListItem>
          </List>
        </Box>
        <Box maxWidth="xs">
          <Heading as="h3" color="hray.800" size="md">
            Support
          </Heading>
          <List marginTop="4" spacing="2">
            <ListItem>
              <Link color="gray.600">Email</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Twitter</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Telegram</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Discord</Link>
            </ListItem>
          </List>
        </Box>
      </Flex>
    </Container>
  );
}
