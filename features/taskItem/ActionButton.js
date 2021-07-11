import {Button} from "@chakra-ui/react";

export default function ActionButton({children, onClick, ...props}) {
  return (
    <Button
      variant="outline"
      colorScheme="green"
      size="lg"
      marginBottom="3"
      onClick={onClick}
      isFullWidth
      {...props}
    >
      {children}
    </Button>
  );
}
