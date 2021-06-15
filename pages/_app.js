import {ChakraProvider} from "@chakra-ui/react";

import Navigation from "components/Navigation";
import theme from "utils/theme";
import "utils/cdm.css";

function MyApp({Component, pageProps}) {
  return (
    <ChakraProvider theme={theme}>
      <Navigation />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
