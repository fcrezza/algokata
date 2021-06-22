import React from "react";
import {useRouter} from "next/router";
import {Button} from "@chakra-ui/button";
import {Box, Container, Heading, Text} from "@chakra-ui/layout";
import {useToast} from "@chakra-ui/react";

import {withProtectedRoute} from "utils/routes";
import {useAuth} from "utils/auth";
import Head from "components/Head";

function Auth() {
  const router = useRouter();
  const {setRole} = useAuth();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleClick = async role => {
    try {
      setIsSubmitting(true);
      await setRole(role);
      setIsSubmitting(false);
      router.push("/home");
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: `Upsss, gagal melakukan operasi`,
        status: "error",
        isClosable: true
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Head title="Autentikasi - Algokata" />
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
          onClick={() => handleClick("teacher")}
          isDisabled={isSubmitting}
          isFullWidth
        >
          Pengajar
        </Button>
        <Button
          variant="outline"
          colorScheme="green"
          size="lg"
          marginBottom="4"
          onClick={() => handleClick("student")}
          isDisabled={isSubmitting}
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

export default withProtectedRoute(Auth);
