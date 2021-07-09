import NextLink from "next/link";
import {LinkBox, Flex, LinkOverlay, Text} from "@chakra-ui/react";

export default function TaskItem({title, href, rightElement}) {
  return (
    <LinkBox
      backgroundColor="gray.100"
      borderRadius="lg"
      _hover={{
        backgroundColor: "gray.200",
        ".edit-button": {
          display: "block"
        }
      }}
    >
      <Flex
        paddingLeft="2"
        paddingRight="6"
        height="45px"
        paddingY="3"
        alignItems="center"
        justifyContent="space-between"
        color="gray.800"
      >
        <NextLink href={href} passHref>
          <LinkOverlay>
            <Text
              textDecoration="none"
              marginLeft="2"
              fontWeight="bold"
              fontSize="lg"
            >
              {title}
            </Text>
          </LinkOverlay>
        </NextLink>
        {rightElement}
      </Flex>
    </LinkBox>
  );
}
