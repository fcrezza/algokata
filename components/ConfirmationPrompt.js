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
  const {
    isOpen,
    onClose,
    title,
    actionTitle,
    successMessage,
    errorMessage,
    description,
    onConfirmation,
    onSuccess = () => {}
  } = props;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  const confirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmation();
      setIsSubmitting(false);
      onClose();
      toast({
        status: "success",
        title: successMessage,
        isClosable: true
      });
      onSuccess();
    } catch (error) {
      setIsSubmitting(false);
      toast({
        status: "error",
        title: errorMessage,
        isClosable: true
      });
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={!isSubmitting ? onClose : () => {}}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {title}
          </AlertDialogHeader>
          <AlertDialogBody>{description}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} isDisabled={isSubmitting}>
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
