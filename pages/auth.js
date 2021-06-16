import {Button} from "@chakra-ui/button";
import {Box, Container, Heading, Text} from "@chakra-ui/layout";
import NextHead from "next/head";

export default function Auth() {
  return (
    <Container maxWidth="lg">
      <NextHead>
        <title>Autentikasi - Algokata</title>
      </NextHead>
      <Box
        marginTop="20"
        borderRadius="xl"
        backgroundColor="white"
        boxShadow="lg"
        padding="8"
      >
        <Heading
          textTransform="capitalize"
          fontSize="3xl"
          marginBottom="8"
          color="gray.800"
        >
          Siapakah anda?
        </Heading>
        <Button
          variant="solid"
          colorScheme="green"
          size="lg"
          marginBottom="4"
          isFullWidth
        >
          Pengajar
        </Button>
        <Button
          variant="outline"
          colorScheme="green"
          size="lg"
          marginBottom="4"
          isFullWidth
        >
          Siswa
        </Button>
        <Text as="i" marginTop="4" color="gray.600" fontSize="sm">
          Catatan: pilihan ini tidak dapat dirubah
        </Text>
      </Box>
    </Container>
  );
}
