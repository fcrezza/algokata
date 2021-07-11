import {ListItem, Flex, Avatar, Text} from "@chakra-ui/react";

export default function StudentItem({fullname, avatar}) {
  return (
    <ListItem
      _notLast={{
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "gray.200"
      }}
    >
      <Flex alignItems="center" paddingY="4">
        <Avatar size="sm" name={fullname} src={avatar} />
        <Text marginLeft="4" color="gray.600">
          {fullname}
        </Text>
      </Flex>
    </ListItem>
  );
}
