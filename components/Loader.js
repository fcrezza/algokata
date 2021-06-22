import {Center, Flex, Spinner} from "@chakra-ui/react";

import {useAuth} from "utils/auth";
import {Logo} from "./Icons";

export function InitialLoader({children}) {
  const {user} = useAuth();

  if (!user) {
    return (
      <Flex
        minWidth="100%"
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Logo width="64" />
      </Flex>
    );
  }

  return children;
}

export function Loader() {
  return (
    <Center width="100%" height="100%">
      <Spinner
        color="green.600"
        emptyColor="gray.200"
        size="lg"
        speed="0.85s"
        thickness="4px"
        label="Loading"
      />
    </Center>
  );
}
