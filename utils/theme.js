import {extendTheme} from "@chakra-ui/react";
import {createBreakpoints} from "@chakra-ui/theme-tools";
import "@fontsource/inter/700.css";
import "@fontsource/inter/900.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/300.css";

const breakpoints = createBreakpoints({
  sm: "320px",
  md: "768px",
  lg: "960px",
  xl: "1200px"
});

const theme = extendTheme({
  breakpoints,
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif"
  }
});

export default theme;
