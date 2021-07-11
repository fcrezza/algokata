import NextLink from "next/link";
import {
  Heading,
  Container,
  Box,
  Text,
  Flex,
  List,
  ListItem,
  Link
} from "@chakra-ui/react";

import {Logo} from "components/Icons";

export default function Footer() {
  return (
    <Container
      paddingY="12"
      marginTop="20"
      maxWidth="container.lg"
      borderTopStyle="solid"
      borderTopColor="gray.200"
      borderTopWidth="thin"
    >
      <Flex>
        <Box maxWidth="xs" marginRight="24">
          <NextLink href="/" passHref>
            <Link>
              <Flex alignItems="center">
                <Logo width="35" height="35" />
                <Text
                  marginLeft="2"
                  fontWeight="bold"
                  fontSize="xl"
                  fontFamily="mono"
                >
                  algokata
                </Text>
              </Flex>
            </Link>
          </NextLink>
          <Text color="gray.600" marginTop="3">
            Platform pembelajaran interaktif pemrograman dan struktur data
            algoritma.
          </Text>
          <Text color="gray.600" marginTop="3">
            © {new Date().getFullYear()} Algokata.
          </Text>
        </Box>
        <Box maxWidth="xs" marginRight="16">
          <Heading as="h3" color="hray.800" size="md">
            Services
          </Heading>
          <List marginTop="4" spacing="2">
            <ListItem>
              <Link color="gray.600">Feedback</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Bantuan</Link>
            </ListItem>
          </List>
        </Box>
        <Box maxWidth="xs">
          <Heading as="h3" color="hray.800" size="md">
            Support
          </Heading>
          <List marginTop="4" spacing="2">
            <ListItem>
              <Link color="gray.600">Email</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Twitter</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Telegram</Link>
            </ListItem>
            <ListItem>
              <Link color="gray.600">Discord</Link>
            </ListItem>
          </List>
        </Box>
      </Flex>
    </Container>
  );
}
