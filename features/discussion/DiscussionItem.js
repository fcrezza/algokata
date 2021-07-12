import {
  Heading,
  Avatar,
  Icon,
  Box,
  Text,
  Flex,
  Link,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  useDisclosure
} from "@chakra-ui/react";
import NextLink from "next/link";
import {MdChat} from "react-icons/md";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/dist/markdown.css";
import React from "react";
import {GoKebabVertical} from "react-icons/go";

import ConfirmationPrompt from "components/ConfirmationPrompt";

const OptionButton = React.forwardRef((props, ref) => {
  return (
    <IconButton
      ref={ref}
      position="absolute"
      variant="ghost"
      top="8px"
      right="8px"
      aria-label="opsi"
      icon={<GoKebabVertical size="18" />}
      isRound
      {...props}
    />
  );
});

export function DiscussionItemPreview(props) {
  const {
    title,
    description,
    authorFullname,
    authorAvatar,
    totalReply,
    timestamp,
    isAuthor,
    tagTitle,
    tagUrl,
    href,
    onDelete
  } = props;

  return (
    <Box
      padding="4"
      borderWidth="1px"
      borderColor="gray.200"
      borderStyle="solid"
      color="gray.800"
      position="relative"
    >
      <Tag colorScheme="green" marginBottom="3">
        <NextLink href={tagUrl}>{tagTitle}</NextLink>
      </Tag>
      <Box marginBottom="3" paddingRight="10">
        <NextLink href={href} passHref>
          <Link>
            <Text color="gray.800" fontSize="xl" fontWeight="bold" isTruncated>
              {title}
            </Text>
          </Link>
        </NextLink>
      </Box>
      <Text color="gray.600" noOfLines={2} fontSize="md">
        {description}
      </Text>
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
        <Flex alignItems="center">
          <Text color="gray.600" fontWeight="medium" marginRight="1">
            {totalReply}
          </Text>
          <Icon as={MdChat} fontSize="24" color="gray.600" />
        </Flex>
      </Flex>
      {isAuthor ? (
        <Menu placement="left-start" isLazy>
          <MenuButton as={OptionButton} />
          <MenuList>
            <MenuItem color="red.500" onClick={onDelete}>
              Hapus
            </MenuItem>
          </MenuList>
        </Menu>
      ) : null}
    </Box>
  );
}

export function DiscussionItemDetail(props) {
  const {isOpen, onClose, onOpen} = useDisclosure();
  const {
    title,
    description,
    authorAvatar,
    authorFullname,
    timestamp,
    isAuthor,
    tagTitle,
    tagUrl,
    onDelete
  } = props;

  return (
    <React.Fragment>
      <ConfirmationPrompt
        title="Hapus diskusi"
        actionTitle="Hapus"
        description="Yakin ingin menghapus diskusi?"
        successMessage="Diskusi berhasil dihapus"
        errorMessage="Operasi gagal dilakukan"
        isOpen={isOpen}
        onClose={onClose}
        onConfirmation={onDelete}
      />
      <Box
        padding="4"
        borderWidth="1px"
        borderColor="gray.200"
        borderStyle="solid"
        color="gray.800"
        position="relative"
      >
        <Tag colorScheme="green" marginBottom="4">
          <NextLink href={tagUrl}>{tagTitle}</NextLink>
        </Tag>
        <Heading as="h3" color="gray.800" fontSize="xl" marginBottom="2">
          {title}
        </Heading>
        <MDEditor.Markdown source={description} />
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
      </Box>
    </React.Fragment>
  );
}
