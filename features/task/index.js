import * as React from "react";
import NextLink from "next/link";
import {useRouter} from "next/router";
import useSWR from "swr";
import {MdAdd, MdCheckCircle} from "react-icons/md";
import {GoKebabVertical} from "react-icons/go";
import {VscCircleOutline} from "react-icons/vsc";
import {
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  LinkBox,
  LinkOverlay,
  Stack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure
} from "@chakra-ui/react";

import TaskItemCreatorModal from "features/task/TaskItemCreatorModal";
import Head from "components/Head";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import {useAuth} from "utils/auth";
import {format} from "date-fns";

export default function Task() {
  const {isOpen, onClose, onOpen} = useDisclosure();
  const {user} = useAuth();
  const router = useRouter();
  const {
    data: activity,
    error,
    mutate
  } = useSWR(`/api/classes/${router.query.cid}/activities/${router.query.tid}`);

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="800px"
      position="relative"
    >
      {(() => {
        if (!activity && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (activity) {
          return (
            <React.Fragment>
              <Head
                title={
                  activity ? `Kelas - ${activity.title}` : "404 Tidak ditemukan"
                }
              />
              {user.role === "teacher" ? (
                <React.Fragment>
                  <Menu placement="left-start" isLazy>
                    <MenuButton as={OptionButton} />
                    <MenuList>
                      <MenuItem>Edit</MenuItem>
                      <MenuItem color="red.500">Hapus</MenuItem>
                    </MenuList>
                  </Menu>
                  <TaskItemCreatorModal isOpen={isOpen} onClose={onClose} />
                </React.Fragment>
              ) : null}
              <Text color="gray.600" fontSize="sm" marginBottom="3">
                {format(new Date(activity.createdAt), "e LLL yyyy")}
              </Text>
              <Heading color="gray.800" marginBottom="5">
                {activity.title}
              </Heading>
              <Text color="gray.600" fontSize="lg">
                {activity.description}
              </Text>
              <Stack marginTop="10" spacing="4">
                {activity.taskItems.map(item => (
                  <TaskItem key={item.id} title={item.title} />
                ))}
                <Button colorScheme="green" onClick={onOpen}>
                  <MdAdd size="24" />
                </Button>
              </Stack>
            </React.Fragment>
          );
        }

        if (!activity && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}

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

function TaskItem({title, isDone}) {
  return (
    <LinkBox
      backgroundColor="gray.100"
      borderRadius="lg"
      _hover={{
        backgroundColor: "gray.200"
      }}
    >
      <NextLink href={"#"} passHref>
        <LinkOverlay>
          <Flex
            paddingLeft="2"
            paddingRight="6"
            paddingY="3"
            alignItems="center"
            justifyContent="space-between"
            color="gray.800"
          >
            <Text
              textDecoration="none"
              marginLeft="2"
              fontWeight="bold"
              fontSize="lg"
            >
              {title}
            </Text>
            <Icon
              as={isDone ? MdCheckCircle : VscCircleOutline}
              color={isDone ? "green.600" : "gray.500"}
              boxSize="6"
            />
          </Flex>
        </LinkOverlay>
      </NextLink>
    </LinkBox>
  );
}
