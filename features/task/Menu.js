import * as React from "react";
import {GoKebabVertical} from "react-icons/go";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from "@chakra-ui/react";

const OptionButton = React.forwardRef((props, ref) => {
  return (
    <IconButton
      ref={ref}
      position="absolute"
      top="12px"
      right="0"
      variant="ghost"
      aria-label="opsi"
      icon={<GoKebabVertical size="18" />}
      isRound
      {...props}
    />
  );
});

export default function TaskMenu({onEdit, onDelete}) {
  return (
    <Menu placement="left-start" isLazy>
      <MenuButton as={OptionButton} />
      <MenuList>
        <MenuItem onClick={onEdit}>Edit</MenuItem>
        <MenuItem color="red.500" onClick={onDelete}>
          Hapus
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
