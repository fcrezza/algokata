import {Button} from "@chakra-ui/react";

export default function ActionButton({children, onClick}) {
  return (
    <Button
      variant="outline"
      colorScheme="green"
      size="lg"
      marginBottom="3"
      onClick={onClick}
      isFullWidth
    >
      {children}
    </Button>
  );
}
