import {ChakraProvider} from "@chakra-ui/react";

import Layout from "components/Layout";
import {InitialLoader} from "components/Loader";
import CustomSWRConfig from "utils/swr-config";
import theme from "utils/theme";
import {AuthProvider} from "utils/auth";

export default function MyApp({Component, pageProps}) {
  return (
    <ChakraProvider theme={theme}>
      <CustomSWRConfig>
        <AuthProvider>
          <InitialLoader>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </InitialLoader>
        </AuthProvider>
      </CustomSWRConfig>
    </ChakraProvider>
  );
}
