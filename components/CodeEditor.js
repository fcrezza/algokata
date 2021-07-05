import dynamic from "next/dynamic";
import {Box} from "@chakra-ui/react";
import {css} from "@emotion/react";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/eclipse.css";

async function loadCodeMirror() {
  const {Controlled} = await import("react-codemirror2");
  return Controlled;
}

const CodeMirror = dynamic(loadCodeMirror, {
  ssr: false
});

const isInBrowser =
  typeof window !== "undefined" && typeof window.navigator !== "undefined";

if (isInBrowser) {
  require("codemirror/mode/javascript/javascript");
}

export default function CodeEditor({onChange = () => {}, value, options}) {
  return (
    <Box
      height="100%"
      css={css`
        .react-codemirror2 {
          height: 100%;
        }
      `}
    >
      <CodeMirror
        value={value}
        onBeforeChange={(editor, data, value) => onChange(value)}
        editorDidMount={editor => editor.setSize("100%", "100%")}
        options={{
          theme: "eclipse",
          lineNumbers: true,
          showCursorWhenSelecting: true,
          lineWrapping: true,
          ...options
        }}
      />
    </Box>
  );
}
