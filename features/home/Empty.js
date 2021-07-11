import {Flex, Text} from "@chakra-ui/react";

import {Umrella} from "components/Illustrations";

export default function Empty({userRole}) {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      marginX="auto"
      alignSelf="center"
    >
      <Umrella width="200" />
      <Text marginTop="6" color="gray.600" textAlign="center">
        {userRole === "student"
          ? "Kamu tidak bergabung dengan kelas apapun :)"
          : "Kamu tidak mengajar kelas apapun :)"}
      </Text>
    </Flex>
  );
}
