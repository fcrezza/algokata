import * as React from "react";
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  Accordion,
  Button,
  useToast
} from "@chakra-ui/react";
import {useRouter} from "next/router";

import Footer from "./Footer";
import FAQItem from "./FaqItem";
import FeatureItem from "./FeatureItem";
import Head from "components/Head";
import {Discussion, Editor, Feedback, Manage} from "components/Illustrations";
import {useAuth} from "utils/auth";

export default function Home() {
  const router = useRouter();
  const toast = useToast();
  const {googleLogin, isAuth} = useAuth();
  const [isClicked, setClickState] = React.useState(false);

  const handleLogin = async () => {
    try {
      setClickState(true);
      const userData = await googleLogin();
      setClickState(false);

      if (userData.role === null) {
        router.push("/auth");
      } else {
        router.push("/home");
      }
    } catch (error) {
      setClickState(false);
      toast({
        title: `Upsss, gagal melakukan autentikasi`,
        status: "error",
        isClosable: true
      });
    }
  };

  return (
    <React.Fragment>
      <Container marginTop="16" maxWidth="container.lg">
        <Head title="Algokata - Belajar pemrograman dan struktur data secara interaktif." />
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
            Bergabung dengan ribuan pengajar dan siswa lain, belajar pemrograman
            lebih menyenangkan dan menarik.
          </Text>
          <Button
            variant="outline"
            colorScheme="green"
            size="lg"
            disabled={isClicked}
            onClick={isAuth ? () => router.push("/home") : handleLogin}
          >
            {isAuth ? "Kembali Ke Halaman Utama" : "Login Dengan Google"}
          </Button>
        </Box>
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
    </React.Fragment>
  );
}
