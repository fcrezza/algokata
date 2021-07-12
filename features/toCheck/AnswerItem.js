import {Box, Text} from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-markdown-preview/dist/markdown.css";

function format(code) {
  return `\`\`\`js
${code}
\`\`\``;
}

export default function AnswerItem({title, solutionCode}) {
  return (
    <Box>
      <Text fontWeight="semibold" fontSize="lg">
        {title}
      </Text>
      <Box marginTop="2">
        <MDEditor.Markdown source={format(solutionCode)} />
      </Box>
    </Box>
  );
}
