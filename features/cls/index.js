import React from "react";
import useSWR from "swr";
import axios from "axios";
import {useRouter} from "next/router";
import {
  Container,
  Heading,
  Text,
  Box,
  Button,
  useDisclosure
} from "@chakra-ui/react";

import Activities from "./Activities";
import ConfirmationPrompt from "./ConfirmationPrompt";
import NotFound from "./NotFound";
import ErrorFallback from "./ErrorFallback";
import EditClassModal from "./EditClassModal";
import Head from "components/Head";
import {Loader} from "components/Loader";
import {useAuth} from "utils/auth";

export default function ClassPage() {
  const {user} = useAuth();
  const router = useRouter();
  const url = `/api/classes/${router.query.cid}`;
  const {data: cls, error, mutate} = useSWR(url);
  const {isOpen, onOpen, onClose} = useDisclosure();

  const onEditClass = async classData => {
    const {data: newClassData} = await axios.put(url, classData);
    console.log(newClassData);
    // change this after successfully update class
    await mutate({...newClassData, isTeacher: true}, false);
    return newClassData;
  };

  const onLeaveClass = async () => {
    await axios.delete(`/api/classes/${router.query.cid}/members/${user.id}`);
    router.push("/home");
  };

  return (
    <Container
      paddingY="6"
      display="flex"
      flexDirection="column"
      flex="1"
      maxWidth="960px"
    >
      {(() => {
        if (!cls && error) {
          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (cls && Object.keys(cls).length > 0) {
          return (
            <React.Fragment>
              <Head
                title={
                  cls ? `Kelas - ${cls.name}` : "404 Kelas Tidak ditemukan"
                }
              />
              <Box
                padding="6"
                height="250px"
                borderRadius="lg"
                backgroundColor="green.600"
                backgroundImage="/assets/images/Coding_Isometric.svg"
                backgroundRepeat="no-repeat"
                backgroundPosition="110% 50px"
                backgroundSize="contain"
              >
                <Heading marginBottom="3" as="h1" fontSize="3xl" color="white">
                  {cls.name}
                </Heading>
                <Text color="whiteAlpha.800" fontSize="lg" marginBottom="4">
                  {cls.description}
                </Text>
                {cls.isTeacher ? (
                  <React.Fragment>
                    <EditClassModal
                      isOpen={isOpen}
                      onClose={onClose}
                      defaultName={cls.name}
                      defaultDescription={cls.description}
                      handleSubmit={onEditClass}
                    />
                    <CTAButton onClick={onOpen}>Pengaturan</CTAButton>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <ConfirmationPrompt
                      title="Keluar Kelas"
                      description="Anda akan tidak punya akses ke kelas ini dan akan dihapus dari
            daftar murid namun data anda tetap akan disimpan di kelas."
                      actionTitle="Keluar"
                      isOpen={isOpen}
                      onClose={onClose}
                      onConfirmation={onLeaveClass}
                    />
                    <CTAButton onClick={onOpen}>Keluar Kelas</CTAButton>
                  </React.Fragment>
                )}
              </Box>
              <Activities cls={cls} />
            </React.Fragment>
          );
        }

        if (cls && Object.keys(cls).length === 0) {
          return <NotFound />;
        }

        if (!cls && !error) {
          return <Loader />;
        }
      })()}
    </Container>
  );
}

function CTAButton({children, onClick}) {
  return (
    <Button
      backgroundColor="green.700"
      color="white"
      onClick={onClick}
      _hover={{
        backgroundColor: "green.700"
      }}
      _active={{
        backgroundColor: "green.800"
      }}
    >
      {children}
    </Button>
  );
}
