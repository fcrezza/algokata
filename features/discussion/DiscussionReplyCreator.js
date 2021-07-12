import * as React from "react";
import axios from "axios";
import {useRouter} from "next/router";
import {mutate} from "swr";
import {Box, Button, Heading, Text} from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/dist/markdown-editor.css";
import "@uiw/react-markdown-preview/dist/markdown.css";

export default function DiscussionReplyCreator() {
  const router = useRouter();
  const {cid: classId, did: discussionId} = router.query;
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  async function onSend() {
    try {
      const url = `/api/classes/${classId}/discussions/${discussionId}/replies`;
      setIsSubmitting(true);
      setError({});
      await axios.post(url, {text});
      await mutate(url);
      await mutate(`/api/classes/${classId}/discussions/${discussionId}`);
      setIsSubmitting(false);
      setText("");
    } catch (e) {
      setIsSubmitting(false);
      if (e.response) {
        setError(e.response.data.error);
      } else {
        setError({message: "Kesalahan saat mengirim request"});
      }
    }
  }

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderStyle="solid"
      marginTop="4"
    >
      <Box
        padding="4"
        borderWidth=" 0 0 1px"
        borderColor="gray.200"
        borderStyle="solid"
      >
        <Heading as="h3" color="gray.800" fontSize="xl">
          Komentar kamu
        </Heading>
      </Box>
      <Box padding="4">
        <MDEditor preview="edit" value={text} onChange={setText} />
        <Text marginY="3" color="red.400">
          {error.message}
        </Text>
        <Button
          marginTop="3"
          colorScheme="green"
          onClick={onSend}
          disabled={isSubmitting}
        >
          Kirim
        </Button>
      </Box>
    </Box>
  );
}
