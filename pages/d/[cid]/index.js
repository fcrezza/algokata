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
  Icon,
  List
} from "@chakra-ui/react";

import {MdChat} from "react-icons/md";

function DiscussionsPage() {
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
          <List spacing="4">
            <ListItem>
              <DiscussionPreview
                title="Saya kesulitan dalam perulangan"
                description="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis in nisl
        eget nulla tristique consequat. Nullam sodales orci et cursus finibus.
        Cras eu sem ex. Suspendisse sed viverra nibh. Cras ut tellus tellus.
        Nullam ultricies tincidunt enim, et rutrum nisi. Nam aliquet justo
        magna, ac consectetur augue imperdiet vitae. Praesent id eros lobortis,
        efficitur nulla non, venenatis lacus."
                authorFullname="Peter lim"
                totalReply={18}
                timestamp="24 Januari 2021"
              />
            </ListItem>
            <ListItem>
              <DiscussionPreview
                title="Saya mendapatkan error seperti ini"
                description="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis in nisl
        eget nulla tristique consequat. Nullam sodales orci et cursus finibus.
        Cras eu sem ex. Suspendisse sed viverra nibh. Cras ut tellus tellus.
        Nullam ultricies tincidunt enim, et rutrum nisi. Nam aliquet justo
        magna, ac consectetur augue imperdiet vitae. Praesent id eros lobortis,
        efficitur nulla non, venenatis lacus."
                authorFullname="Langgeng Widodo"
                totalReply={2}
                timestamp="24 Januari 2021"
              />
            </ListItem>
            <ListItem>
              <DiscussionPreview
                title="Help: Pengkondisian bercabang"
                description="
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis in nisl
        eget nulla tristique consequat. Nullam sodales orci et cursus finibus.
        Cras eu sem ex. Suspendisse sed viverra nibh. Cras ut tellus tellus.
        Nullam ultricies tincidunt enim, et rutrum nisi. Nam aliquet justo
        magna, ac consectetur augue imperdiet vitae. Praesent id eros lobortis,
        efficitur nulla non, venenatis lacus."
                authorFullname="Langgeng Widodo"
                totalReply={20}
                timestamp="20 Januari 2021"
              />
            </ListItem>
          </List>
        </Box>
      </Flex>
    </Container>
  );
}

function DiscussionPreview({
  title,
  description,
  authorFullname,
  authorAvatar,
  totalReply,
  timestamp
}) {
  return (
    <Box
      padding="4"
      borderWidth="1px"
      borderColor="gray.200"
      borderStyle="solid"
      color="gray.800"
    >
      <Heading as="h3" color="gray.800" fontSize="xl" marginBottom="2">
        {title}
      </Heading>
      <Text color="gray.600" noOfLines={2} fontSize="md">
        {description}
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
        <Flex alignItems="center">
          <Text color="gray.600" fontWeight="medium" marginRight="1">
            {totalReply}
          </Text>
          <Icon as={MdChat} fontSize="24" color="gray.600" />
        </Flex>
      </Flex>
    </Box>
  );
}

export default DiscussionsPage;
