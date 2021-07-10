import * as React from "react";
import {MdInfo} from "react-icons/md";
import {GoKebabVertical} from "react-icons/go";
import {
  Flex,
  Icon,
  Box,
  Text,
  Heading,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from "@chakra-ui/react";

export default function AnnouncementItem(props) {
  const {title, message, timestamp, isTeacher, onDelete} = props;

  return (
    <Flex
      paddingX="4"
      paddingY="5"
      borderRadius="lg"
      borderColor="gray.200"
      borderStyle="solid"
      borderWidth="1px"
      position="relative"
    >
      <Icon as={MdInfo} fontSize="48" color="green.500" />
      <Box marginLeft="5">
        <Text fontSize="sm" color="gray.500" marginBottom="2">
          {timestamp}
        </Text>
        <Heading
          as="h2"
          fontSize="xl"
          color="gray.800"
          marginBottom="3"
          fontWeight="semibold"
        >
          {title}
        </Heading>
        <Text color="gray.600">{message}</Text>
      </Box>
      {isTeacher ? (
        <Menu placement="left-start" isLazy>
          <MenuButton as={OptionButton} />
          <MenuList>
            <MenuItem color="red.500" onClick={onDelete}>
              Hapus
            </MenuItem>
          </MenuList>
        </Menu>
      ) : null}
    </Flex>
  );
}

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
