import {Box, Text, Button} from "@chakra-ui/react";

export default function ErrorFallback({onRetry, errorMessage}) {
  return (
    <Box alignSelf="center" marginX="auto" textAlign="center">
      <Text>{errorMessage}</Text>
      <Button
        marginTop="4"
        variant="ghost"
        colorScheme="green"
        onClick={onRetry}
      >
        Coba lagi
      </Button>
    </Box>
  );
}
