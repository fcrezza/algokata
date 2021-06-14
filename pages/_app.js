import {ChakraProvider} from "@chakra-ui/react";

import theme from "utils/theme";
import "utils/cdm.css";

function MyApp({Component, pageProps}) {
  return (
    <ChakraProvider theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
