import {
  Container,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Text,
  Link,
  UnorderedList,
  ListItem,
  Avatar,
  List,
  Input,
  IconButton
} from "@chakra-ui/react";
import {AiOutlineSend} from "react-icons/ai";

import {useAuth} from "utils/auth";

function DiscussionsPage() {
  const {user} = useAuth();
  // const {data: cls, error, mutate} = useSWR(`/api/classes/${router.query.cid}`);

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="960px"
    >
      {/* <Head title={cls ? `Diskusi - ${cls.name}` : "404 Kelas Tidak ditemukan"} /> */}
      <Flex alignItems="flex-start" width="100%">
        <Accordion
          allowToggle
          width="300px"
          borderWidth="0 1px"
          borderStyle="solid"
          borderColor="gray.200"
        >
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" color="gray.800" isTruncated>
                Pertemuan 1: Tipe data dan variabel
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <UnorderedList spacing="4" color="gray.600">
                <ListItem>
                  <Link href="#">Deklarasi variabel</Link>
                </ListItem>
                <ListItem>
                  <Link href="#">Tipe data number</Link>
                </ListItem>
                <ListItem>
                  <Link href="#">Tipe data string</Link>
                </ListItem>
                <ListItem>
                  <Link href="#">Tipe data boolean</Link>
                </ListItem>
              </UnorderedList>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left" color="gray.800" isTruncated>
                Pertemuan 2: Pengkondisian dan Percabangan
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <UnorderedList spacing="4" color="gray.600">
                <ListItem>
                  <Link href="#">Statement if</Link>
                </ListItem>
                <ListItem>
                  <Link href="#">Statement else</Link>
                </ListItem>
                <ListItem>
                  <Link href="#">Statement else if</Link>
                </ListItem>
                <ListItem>
                  <Link href="#">Perpaduan if, else if, else</Link>
                </ListItem>
              </UnorderedList>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Box marginLeft="10" flex="1" width="100%">
          <Box
            padding="4"
            borderWidth="1px"
            borderColor="gray.200"
            borderStyle="solid"
            color="gray.800"
          >
            <Heading as="h3" color="gray.800" fontSize="xl" marginBottom="2">
              Help: Pengkondisian bercabang
            </Heading>
            <Text color="gray.600" fontSize="md">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis in
              nisl eget nulla tristique consequat. Nullam sodales orci et cursus
              finibus. Cras eu sem ex. Suspendisse sed viverra nibh. Cras ut
              tellus tellus. Nullam ultricies tincidunt enim, et rutrum nisi.
              Nam aliquet justo magna, ac consectetur augue imperdiet vitae.
              Praesent id eros lobortis, efficitur nulla non, venenatis lacus.
            </Text>
            <Flex
              alignItems="center"
              justifyContent="space-between"
              marginTop="6"
            >
              <Flex alignItems="center">
                <Avatar size="sm" name="Langgeng Widodo" />
                <Text marginLeft="3" color="gray.500" fontSize="sm">
                  Langgeng Widodo
                </Text>
                <Box
                  width="3px"
                  height="3px"
                  backgroundColor="gray.500"
                  borderRadius="50%"
                  marginX="3"
                ></Box>
                <Text color="gray.500" fontSize="sm">
                  20 Januari 2021
                </Text>
              </Flex>
            </Flex>
          </Box>
          <Flex
            marginTop="4"
            padding="4"
            borderWidth="1px"
            borderStyle="solid"
            borderColor="gray.200"
          >
            <Avatar src={user.avatar} size="sm" />
            <Input marginLeft="4" placeholder="Komentar kamu" />
            <IconButton marginLeft="4" icon={<AiOutlineSend />} />
          </Flex>
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
                Balasan(2)
              </Heading>
            </Box>
            <List spacing="4">
              <ListItem
                borderBottomWidth="1px"
                borderBottomStyle="solid"
                borderBottomColor="gray.200"
              >
                <ReplyItem
                  text="Oh itu begini mas... oke?"
                  authorFullname="Bisro Waseso"
                  timestamp="26 Januari 2021"
                />
              </ListItem>
              <ListItem>
                <ReplyItem
                  text="LOL, begini gimana bro"
                  authorFullname="Sabren samikov"
                  timestamp="26 Januari 2021"
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
}

function ReplyItem({text, authorFullname, authorAvatar, timestamp}) {
  return (
    <Box padding="4">
      <Text color="gray.600" fontSize="md">
        {text}
      </Text>
      <Flex alignItems="center" justifyContent="space-between" marginTop="6">
        <Flex alignItems="center">
          <Avatar size="sm" name={authorFullname} />
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
  );
}

export default DiscussionsPage;
