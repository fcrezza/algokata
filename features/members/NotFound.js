import {Flex, Text} from "@chakra-ui/react";

import {NotFound as NotFoundIllustration} from "components/Illustrations";

export default function NotFound() {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      marginX="auto"
      alignSelf="center"
    >
      <NotFoundIllustration width="200" />
      <Text marginTop="6" color="gray.600" textAlign="center">
        Kelas tidak ditemukan
      </Text>
    </Flex>
  );
}
