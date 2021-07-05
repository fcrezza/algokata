import {Container, Flex} from "@chakra-ui/react";

import Head from "components/Head";
import DiscussionItems from "./DiscussionItems";
import ListTask from "./ListTask";

export default function Discussion() {
  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="960px"
    >
      <Head title="Diskusi - Algokata" />
      <Flex alignItems="flex-start" width="100%">
        <ListTask />
        <DiscussionItems />
      </Flex>
    </Container>
  );
}
