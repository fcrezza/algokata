import {List, ListItem, ListIcon, Box, Heading, Text} from "@chakra-ui/react";
import {BiInfoCircle, BiTask} from "react-icons/bi";

export default function Empty({isTeacher}) {
  if (isTeacher) {
    return (
      <Box
        marginTop="8"
        padding="6"
        borderRadius="lg"
        borderColor="gray.300"
        borderWidth="1px"
        borderStyle="solid"
      >
        <Heading as="h3" color="green.600" fontWeight="medium" fontSize="2xl">
          Mulai interaksi dengan murid di kelas anda
        </Heading>
        <List marginTop="6" spacing="3">
          <ListItem color="gray.600">
            <ListIcon as={BiInfoCircle} fontSize="20px" />
            Buat pengumuman untuk memberitahu info penting
          </ListItem>
          <ListItem color="gray.600">
            <ListIcon as={BiTask} fontSize="20px" />
            Buat tugas untuk murid anda
          </ListItem>
        </List>
      </Box>
    );
  }

  return (
    <Text textAlign="center" marginTop="8" color="gray.600">
      tidak ada apa-apa disini
    </Text>
  );
}
