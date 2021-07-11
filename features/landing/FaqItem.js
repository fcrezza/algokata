import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box
} from "@chakra-ui/react";

export default function FAQItem({question, answer}) {
  return (
    <AccordionItem>
      <AccordionButton>
        <Box
          flex="1"
          textAlign="left"
          fontSize="lg"
          fontWeight="semibold"
          color="gray.700"
        >
          {question}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel pb={4} textAlign="left" color="gray.600">
        {answer}
      </AccordionPanel>
    </AccordionItem>
  );
}
