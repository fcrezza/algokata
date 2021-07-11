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
import NotFound from "./NotFound";
import EditClassModal from "./EditClassModal";
import ErrorFallback from "components/ErrorFallback";
import ConfirmationPrompt from "components/ConfirmationPrompt";
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
    await mutate(newClassData, false);
    return newClassData;
  };

  const onLeaveClass = async () => {
    await axios.delete(`/api/classes/${router.query.cid}/members/${user.id}`);
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
          if (error.response && error.response.data.error.code === 404) {
            return (
              <React.Fragment>
                <Head title="404 Kelas Tidak ditemukan" />
                <NotFound />
              </React.Fragment>
            );
          }

          return (
            <ErrorFallback
              errorMessage="Upsss, Gagal memuat data"
              onRetry={() => mutate(null)}
            />
          );
        }

        if (cls) {
          return (
            <React.Fragment>
              <Head title={`Kelas - ${cls.name}`} />
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
                      onEdit={onEditClass}
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
                      successMessage="Kamu telah keluar kelas"
                      errorMessage="Operasi gagal dilakukan"
                      isOpen={isOpen}
                      onClose={onClose}
                      onConfirmation={onLeaveClass}
                      onSuccess={() => router.push("/home")}
                    />
                    <CTAButton onClick={onOpen}>Keluar Kelas</CTAButton>
                  </React.Fragment>
                )}
              </Box>
              <Activities cls={cls} />
            </React.Fragment>
          );
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
