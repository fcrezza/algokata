import * as React from "react";
import {
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button
} from "@chakra-ui/react";

export default function ConfirmationPrompt(props) {
  const {isOpen, onClose, title, actionTitle, description, onConfirmation} =
    props;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  const confirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmation();
    } catch (error) {
      setIsSubmitting(false);
      toast({
        status: "error",
        title: `Upsss, gagal melakukan operasi`,
        isClosable: true
      });
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>{description}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Batal
            </Button>
            <Button
              colorScheme="red"
              onClick={confirm}
              ml={3}
              isDisabled={isSubmitting}
            >
              {actionTitle}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}
