import useSWR from "swr";
import {useRouter} from "next/router";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Text,
  Link,
  UnorderedList,
  ListItem
} from "@chakra-ui/react";

import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";

export default function ListTask() {
  const router = useRouter();
  const url = `/api/classes/${router.query.cid}/activities?type=task&order=asc`;
  const {data: tasks, error, mutate} = useSWR(url);
  const accordionItems = [];
  let activeIndex = 0;

  if (!tasks && error) {
    return (
      <Flex
        justifyContent="center"
        alignItems="center"
        width="300px"
        height="150px"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="gray.200"
      >
        {error.response && error.response.data.error.code === 404 ? (
          <Text color="gray.600">{error.response.data.error.message}</Text>
        ) : (
          <ErrorFallback
            errorMessage="Upsss, Gagal memuat data"
            onRetry={() => mutate(null)}
          />
        )}
      </Flex>
    );
  }

  if (tasks && tasks.length > 0) {
    tasks.forEach(function (task, taskIndex) {
      const taskTitle = task.title;
      const taskItems = [];

      task.taskItems.forEach(function (item) {
        const taskItemUrl = `/d/${router.query.cid}?taskItem=${item.id}`;
        const isUrlMatch = router.query.taskItem === item.id;
        let taskItem;

        if (isUrlMatch) {
          activeIndex = taskIndex;
          taskItem = (
            <ListItem key={item.id} fontWeight="semibold">
              {item.title}
            </ListItem>
          );
        } else {
          taskItem = (
            <ListItem key={item.id}>
              <Link href={taskItemUrl}>{item.title}</Link>
            </ListItem>
          );
        }

        taskItems.push(taskItem);
      });

      const accordionItem = (
        <AccordionItem key={task.id}>
          <AccordionButton>
            <Box flex="1" textAlign="left" color="gray.800" isTruncated>
              {taskTitle}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <UnorderedList spacing="4" color="gray.600">
              {taskItems}
            </UnorderedList>
          </AccordionPanel>
        </AccordionItem>
      );

      accordionItems.push(accordionItem);
    });

    return (
      <Accordion
        defaultIndex={activeIndex}
        width="300px"
        borderWidth="0 1px"
        borderStyle="solid"
        borderColor="gray.200"
        allowToggle
      >
        {accordionItems}
      </Accordion>
    );
  }

  if (tasks && tasks.length === 0) {
    return (
      <Flex
        width="300px"
        height="150px"
        justifyContent="center"
        alignItems="center"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="gray.200"
      >
        <Text color="gray.600">Tidak ada tugas</Text>
      </Flex>
    );
  }

  if (!tasks && !error) {
    return (
      <Flex
        width="300px"
        height="150px"
        justifyContent="center"
        alignItems="center"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="gray.200"
      >
        <Loader />
      </Flex>
    );
  }
}
