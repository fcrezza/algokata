import * as React from "react";
import NextLink from "next/link";
import {GoKebabVertical} from "react-icons/go";
import {MdClass} from "react-icons/md";
import {
  LinkBox,
  LinkOverlay,
  Icon,
  IconButton,
  Flex,
  Box,
  Text,
  Menu,
  MenuItem,
  MenuList,
  MenuButton
} from "@chakra-ui/react";

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

export default function TaskItem(props) {
  const {timestamp, url, title, isTeacher, onEdit, onDelete} = props;
  return (
    <LinkBox
      _hover={{
        backgroundColor: "gray.50"
      }}
      position="relative"
    >
      <NextLink href={url} passHref>
        <LinkOverlay>
          <Flex
            paddingX="4"
            paddingY="5"
            borderRadius="lg"
            borderColor="gray.200"
            borderStyle="solid"
            borderWidth="1px"
          >
            <Icon as={MdClass} fontSize="40" color="green.500" />
            <Box marginLeft="5">
              <Text fontSize="sm" color="gray.500" marginBottom="1">
                {timestamp}
              </Text>
              <Text color="gray.800" fontWeight="semibold" fontSize="lg">
                {title}
              </Text>
            </Box>
          </Flex>
        </LinkOverlay>
      </NextLink>
      {isTeacher ? (
        <Menu placement="left-start" isLazy>
          <MenuButton as={OptionButton} />
          <MenuList>
            <MenuItem onClick={onEdit}>Edit</MenuItem>
            <MenuItem color="red.500" onClick={onDelete}>
              Hapus
            </MenuItem>
          </MenuList>
        </Menu>
      ) : null}
    </LinkBox>
  );
}
