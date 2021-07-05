import * as React from "react";
import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Button
} from "@chakra-ui/react";
import {useRouter} from "next/router";

// TODO: Impelement full search feature
export default function DiscussionSearch({onSearch, onOpenModal}) {
  const router = useRouter();
  const {q: defaultValue} = router.query;
  const [searchValue, setSearchValue] = React.useState(() =>
    defaultValue ? defaultValue : ""
  );

  return (
    <Flex marginBottom="8">
      <InputGroup size="md">
        <Input
          paddingRight="4.5rem"
          placeholder="Cari diskusi"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          isDisabled // remove this
        />
        <InputRightElement width="4.5rem">
          <Button
            height="1.75rem"
            size="sm"
            colorScheme="green"
            onClick={() => onSearch(searchValue)}
            disabled={searchValue.length === 0}
          >
            Cari
          </Button>
        </InputRightElement>
      </InputGroup>
      <Button marginLeft="4" onClick={onOpenModal}>
        Buat +
      </Button>
    </Flex>
  );
}
