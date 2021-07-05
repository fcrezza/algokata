import React from "react";
import {useRouter} from "next/router";
import querystring from "query-string";
import useSWR from "swr";
import axios from "axios";
import {List, Box, ListItem, Flex, Text, useDisclosure} from "@chakra-ui/react";

import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import DiscussionSearch from "./DiscussionSearch";
import {DiscussionItemPreview} from "./DiscussionItem";
import DiscussionCreatorModal from "./DiscussionCreatorModal";
import {useAuth} from "utils/auth";
import formatTimestamp from "utils/formatTimestamp";

export default function DiscussionItems() {
  const router = useRouter();
  const {user} = useAuth();
  const {isOpen, onClose, onOpen} = useDisclosure();
  const {cid: classId, taskItem, q} = router.query;
  let url = `/api/classes/${classId}/discussions`;

  if (taskItem || q) {
    const query = {taskItemId: taskItem, q};
    url += `?${querystring.stringify(query)}`;
  }

  const {data: discussions, error, mutate} = useSWR(url);

  function handleSearch(searchValue) {
    let routeUrl = `/d/${classId}`;
    routeUrl += `?${querystring.stringify({q: searchValue})}`;
    router.push(routeUrl);
  }

  async function handleCreateDiscussion(
    title,
    description,
    taskId,
    taskItemId
  ) {
    const requestBody = {
      title,
      description,
      taskId,
      taskItemId
    };
    const url = `/api/classes/${classId}/discussions`;
    const {data: newDiscussion} = await axios.post(url, requestBody);
    await mutate([newDiscussion, ...discussions], false);
  }

  async function onDelete(discussionId) {
    const url = `/api/classes/${classId}/discussions/${discussionId}`;
    await axios.delete(url);
    await mutate();
  }

  return (
    <Box marginLeft="10" flex="1" width="100%" maxWidth="620px">
      {(function () {
        if (!discussions && error) {
          return (
            <Flex justifyContent="center" alignItems="center">
              <ErrorFallback
                errorMessage="Upsss, gagal memuat data"
                onRetry={() => mutate(null)}
              />
            </Flex>
          );
        }

        if (discussions && discussions.length > 0) {
          const discussionsItem = discussions.map(function (d) {
            const url = `/d/${classId}/${d.id}`;
            const tagUrl = `/d/${classId}?taskItem=${d.taskItem.id}`;
            const timestamp = formatTimestamp(d.createdAt);

            return (
              <ListItem key={d.id}>
                <DiscussionItemPreview
                  href={url}
                  title={d.title}
                  description={d.description}
                  authorAvatar={d.author.avatar}
                  authorFullname={d.author.fullname}
                  totalReply={d.repliesCount}
                  timestamp={timestamp}
                  isAuthor={user.id === d.author.id}
                  tagTitle={d.taskItem.title}
                  tagUrl={tagUrl}
                  onDelete={() => onDelete(d.id)}
                />
              </ListItem>
            );
          });

          return (
            <React.Fragment>
              <DiscussionCreatorModal
                isOpen={isOpen}
                onClose={onClose}
                onCreate={handleCreateDiscussion}
              />
              <DiscussionSearch onSearch={handleSearch} onOpenModal={onOpen} />
              <List spacing="4" marginTop="8">
                {discussionsItem}
              </List>
            </React.Fragment>
          );
        }

        if (discussions && discussions.length === 0) {
          return (
            <React.Fragment>
              <DiscussionCreatorModal
                isOpen={isOpen}
                onClose={onClose}
                onCreate={handleCreateDiscussion}
              />
              <DiscussionSearch onSearch={handleSearch} onOpenModal={onOpen} />
              <Flex justifyContent="center" marginTop="8" alignItems="center">
                <Text color="gray.600">Tidak ada diskusi</Text>
              </Flex>
            </React.Fragment>
          );
        }

        if (!discussions && !error) {
          return (
            <Flex justifyContent="center" alignItems="center">
              <Loader />
            </Flex>
          );
        }
      })()}
    </Box>
  );
}
