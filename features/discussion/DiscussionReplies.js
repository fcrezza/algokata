import {
  Box,
  Text,
  Flex,
  Avatar,
  Heading,
  List,
  ListItem,
  IconButton,
  MenuList,
  Menu,
  MenuItem,
  MenuButton,
  useDisclosure
} from "@chakra-ui/react";
import {useRouter} from "next/router";
import useSWR from "swr";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/dist/markdown.css";
import {format} from "date-fns";
import React from "react";
import {GoKebabVertical} from "react-icons/go";

import {Loader} from "components/Loader";
import ErrorFallback from "features/cls/ErrorFallback";
import {useAuth} from "utils/auth";
import ConfirmationPrompt from "components/ConfirmationPrompt";
import axios from "axios";

export default function DiscussionReplies({total}) {
  const router = useRouter();
  const {cid: classId, did: discussionId} = router.query;
  const {user} = useAuth();
  const url = `/api/classes/${classId}/discussions/${discussionId}/replies`;
  const {data: replies, error, mutate} = useSWR(url);

  async function onDelete(replyId) {
    const url = `/api/classes/${classId}/discussions/${discussionId}/replies/${replyId}`;
    await axios.delete(url);
    await mutate();
  }

  if (!replies && error) {
    return (
      <Flex marginTop="8" justifyContent="center" alignItems="center">
        <ErrorFallback
          errorMessage="Upsss, gagal memuat data"
          onRetry={() => mutate(null)}
        />
      </Flex>
    );
  }

  if (replies) {
    const replyItems = replies.map(function (r) {
      const timestamp = format(new Date(r.createdAt), "e LLLL yyyy");
      return (
        <DiscussionReplyItem
          key={r.id}
          text={r.text}
          authorFullname={r.author.fullname}
          authorAvatar={r.author.avatar}
          timestamp={timestamp}
          isAuthor={r.author.id === user.id}
          onDelete={() => onDelete(r.id)}
        />
      );
    });

    return (
      <Box
        borderWidth="1px"
        borderColor="gray.200"
        borderStyle="solid"
        marginTop="8"
      >
        <Box
          padding="4"
          borderWidth=" 0 0 1px"
          borderColor="gray.200"
          borderStyle="solid"
        >
          <Heading as="h3" color="gray.800" fontSize="xl">
            {`Balasan(${total})`}
          </Heading>
        </Box>
        {replyItems.length > 0 ? (
          <List spacing="4">{replyItems}</List>
        ) : (
          <Flex justifyContent="center" padding="6" alignItems="center">
            <Text color="gray.600">Belum ada komentar</Text>
          </Flex>
        )}
      </Box>
    );
  }

  if (!replies && !error) {
    return (
      <Flex marginTop="8" justifyContent="center" alignItems="center">
        <Loader />
      </Flex>
    );
  }
}

const OptionButton = React.forwardRef((props, ref) => {
  return (
    <IconButton
      ref={ref}
      position="absolute"
      variant="ghost"
      top="0"
      right="8px"
      aria-label="opsi"
      icon={<GoKebabVertical size="18" />}
      isRound
      {...props}
    />
  );
});

function DiscussionReplyItem(props) {
  const {onOpen, onClose, isOpen} = useDisclosure();
  const {text, authorFullname, authorAvatar, isAuthor, timestamp, onDelete} =
    props;

  return (
    <ListItem
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor="gray.200"
      position="relative"
    >
      <ConfirmationPrompt
        title="Hapus Komentar"
        actionTitle="Hapus"
        description="Yakin ingin menghapus komentar?"
        successMessage="Komentar berhasil dihapus"
        errorMessage="Operasi gagal dilakukan"
        isOpen={isOpen}
        onClose={onClose}
        onConfirmation={onDelete}
      />
      <Box padding="4">
        <MDEditor.Markdown source={text} />
        <Flex alignItems="center" justifyContent="space-between" marginTop="6">
          <Flex alignItems="center">
            <Avatar src={authorAvatar} size="sm" name={authorFullname} />
            <Text marginLeft="3" color="gray.500" fontSize="sm">
              {authorFullname}
            </Text>
            <Box
              width="3px"
              height="3px"
              backgroundColor="gray.500"
              borderRadius="50%"
              marginX="3"
            ></Box>
            <Text color="gray.500" fontSize="sm">
              {timestamp}
            </Text>
          </Flex>
        </Flex>
      </Box>
      {isAuthor ? (
        <Menu placement="left-start" isLazy>
          <MenuButton as={OptionButton} />
          <MenuList>
            <MenuItem color="red.500" onClick={onOpen}>
              Hapus
            </MenuItem>
          </MenuList>
        </Menu>
      ) : null}
    </ListItem>
  );
}
