import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { SWRConfig } from "swr";
import App from "./App";
import theme from "./theme";
import CssBaseline from "@mui/material/CssBaseline";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SWRConfig>
        <CssBaseline />
        <App />
      </SWRConfig>
    </ThemeProvider>
  </React.StrictMode>
);
