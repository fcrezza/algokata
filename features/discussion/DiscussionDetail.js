import * as React from "react";
import useSWR from "swr";
import {useRouter} from "next/router";
import {Container, Box, Flex, Text} from "@chakra-ui/react";

import Head from "components/Head";
import ErrorFallback from "components/ErrorFallback";
import DiscussionReplies from "./DiscussionReplies";
import ListTask from "features/discussion/ListTask";
import {DiscussionItemDetail} from "./DiscussionItem";
import {Loader} from "components/Loader";
import DiscussionReplyCreator from "./DiscussionReplyCreator";
import {useAuth} from "utils/auth";
import formatTimestamp from "utils/formatTimestamp";
import axios from "axios";

function DiscussionDetail() {
  const router = useRouter();
  const {user} = useAuth();
  const {cid: classId, did: discussionId} = router.query;
  const url = `/api/classes/${classId}/discussions/${discussionId}`;
  const {data: discussion, error, mutate} = useSWR(url);

  async function onDelete() {
    const url = `/api/classes/${classId}/discussions/${discussionId}`;
    await axios.delete(url);
    router.push(`/d/${classId}`);
  }

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="960px"
    >
      <Flex alignItems="flex-start" width="100%">
        <ListTask />
        {(function () {
          if (!discussion && error) {
            return (
              <Flex
                marginLeft="10"
                flex="1"
                width="100%"
                justifyContent="center"
                alignItems="center"
              >
                <ErrorFallback
                  errorMessage="Upsss, gagal memuat data"
                  onRetry={() => mutate(null)}
                />
              </Flex>
            );
          }

          if (discussion && Object.keys(discussion).length > 0) {
            const timestamp = formatTimestamp(discussion.createdAt);

            return (
              <React.Fragment>
                <Head title={`Diskusi - discussion.title`} />

                <Box marginLeft="10" flex="1" width="100%">
                  <DiscussionItemDetail
                    title={discussion.title}
                    description={discussion.description}
                    timestamp={timestamp}
                    authorFullname={discussion.author.fullname}
                    authorAvatar={discussion.author.avatar}
                    isAuthor={discussion.author.id === user.id}
                    tagTitle={discussion.taskItem.title}
                    tagUrl={`/d/${classId}?taskItem=${discussion.taskItem.id}`}
                    onDelete={onDelete}
                  />
                  <DiscussionReplyCreator />
                  <DiscussionReplies total={discussion.repliesCount} />
                </Box>
              </React.Fragment>
            );
          }

          if (discussion && Object.keys(discussion).length === 0) {
            return (
              <Flex
                marginLeft="10"
                flex="1"
                width="100%"
                justifyContent="center"
                alignItems="center"
              >
                <Head title="404 Diskusi tidak ditemukan" />
                <Text color="gray.600">Diskusi tidak ditemukan</Text>
              </Flex>
            );
          }

          if (!discussion && !error) {
            return (
              <Flex
                marginLeft="10"
                flex="1"
                width="100%"
                justifyContent="center"
                alignItems="center"
              >
                <Loader />
              </Flex>
            );
          }
        })()}
      </Flex>
    </Container>
  );
}

export default DiscussionDetail;
