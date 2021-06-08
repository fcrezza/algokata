import NextLink from "next/link";
import {
  Container,
  Flex,
  Link,
  LinkBox,
  LinkOverlay,
  Text
} from "@chakra-ui/react";

import {Logo} from "components/Icons";

export default function Navigation() {
  return (
    <Container maxWidth="container.lg">
      <Flex paddingY="6" justifyContent="space-between">
        <LinkBox>
          <NextLink href="/" passHref>
            <LinkOverlay>
              <Flex alignItems="center">
                <Logo width="35" height="35" />
                <Text
                  textDecoration="none"
                  marginLeft="2"
                  fontWeight="bold"
                  fontSize="xl"
                  fontFamily="mono"
                >
                  algokata
                </Text>
              </Flex>
            </LinkOverlay>
          </NextLink>
        </LinkBox>
        <Flex alignItems="center">
          <Link href="#" marginRight="12">
            Fitur
          </Link>
          <Link href="#">FAQ</Link>
        </Flex>
      </Flex>
    </Container>
  );
}
