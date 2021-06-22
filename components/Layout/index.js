import {Flex} from "@chakra-ui/react";
import Navigation from "./Navigation";

export default function Layout({children}) {
  return (
    <Flex flexDirection="column" minHeight="100vh">
      <Navigation />
      {children}
    </Flex>
  );
}
