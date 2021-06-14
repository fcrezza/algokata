import {Button} from "@chakra-ui/button";
import {Box, Container, Heading, Text} from "@chakra-ui/layout";
import Navigation from "components/Navigation";
import NextHead from "next/head";

export default function Auth() {
  return (
    <>
      <NextHead>
        <title>Autentikasi - Algokata</title>
      </NextHead>
      <Navigation />
      <Container maxWidth="lg">
        <Box
          marginTop="20"
          borderRadius="xl"
          backgroundColor="white"
          boxShadow="lg"
          padding="8"
        >
          <Heading
            textTransform="capitalize"
            fontSize="xx-large"
            marginBottom="10"
            color="gray.800"
          >
            Beritahu kami siapa kamu
          </Heading>
          <Button
            variant="solid"
            colorScheme="green"
            size="lg"
            marginBottom="4"
            isFullWidth
          >
            Saya Seorang Pengajar
          </Button>
          <Button
            variant="outline"
            colorScheme="green"
            size="lg"
            marginBottom="4"
            isFullWidth
          >
            Saya Seorang Siswa
          </Button>
          <Text as="i" marginTop="4" color="gray.600" fontSize="sm">
            Catatan: pilihan ini tidak dapat dirubah
          </Text>
        </Box>
      </Container>
    </>
  );
}
