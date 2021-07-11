import {Box, Heading, Center} from "@chakra-ui/react";

export default function FeatureItem({title, illustration: Illustration}) {
  return (
    <Box
      borderRadius="xl"
      borderWidth="2px"
      borderColor="gray.300"
      borderStyle="solid"
      padding="8"
    >
      <Heading
        as="h3"
        fontSize="2xl"
        color="gray.700"
        textAlign="center"
        marginBottom="10"
      >
        {title}
      </Heading>
      <Center>
        <Illustration width="200" />
      </Center>
    </Box>
  );
}
