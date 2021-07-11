import * as React from "react";
import useSWR from "swr";
import {Container, Wrap} from "@chakra-ui/react";

import ClassItem from "./ClassItem";
import Empty from "./Empty";
import Head from "components/Head";
import ErrorFallback from "components/ErrorFallback";
import {Loader} from "components/Loader";
import {useAuth} from "utils/auth";

export default function Home() {
  const {user} = useAuth();
  const {data: clss, error, mutate} = useSWR(`/api/users/${user.id}/classes`);

  return (
    <Container padding="6" display="flex" flex="1" maxWidth="full">
      <Head title={`Home - ${user.fullname}`} />
      {(function () {
        if (!clss && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (clss) {
          const classItems = clss.map(c => (
            <ClassItem
              key={c.id}
              href={`/c/${c.id}`}
              name={c.name}
              teacherFullname={c.teacher.fullname}
              teacherAvatar={c.teacher.avatar}
            />
          ));

          if (classItems.length > 0) {
            return <Wrap spacing="6">{classItems}</Wrap>;
          }

          return <Empty userRole={user.role} />;
        }

        if (!clss & !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}
