import NextLink from "next/link";
import {
  LinkBox,
  LinkOverlay,
  Box,
  Heading,
  Text,
  Avatar
} from "@chakra-ui/react";

export default function ClassItem({
  href,
  name,
  teacherFullname,
  teacherAvatar
}) {
  return (
    <LinkBox
      _hover={{
        boxShadow: "xl"
      }}
    >
      <NextLink href={href} passHref>
        <LinkOverlay>
          <Box
            width="300px"
            borderRadius="lg"
            overflow="hidden"
            position="relative"
            padding="4"
            height="180px"
            backgroundColor="green.600"
            backgroundImage="/assets/images/waves.svg"
            backgroundRepeat="no-repeat"
            backgroundPosition="right bottom"
            backgroundSize="contain"
          >
            <Heading color="white" fontSize="2xl" marginBottom="2" isTruncated>
              {name}
            </Heading>
            <Text color="whiteAlpha.800">{teacherFullname}</Text>
            <Avatar
              position="absolute"
              right="8%"
              bottom="8%"
              size="md"
              loading="lazy"
              name={teacherFullname}
              src={teacherAvatar}
            />
          </Box>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
}
