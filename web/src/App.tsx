import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";

import { MantineProvider } from "@mantine/core";

export default function App() {
  return (
    <MantineProvider>
      <div>Hello world</div>
    </MantineProvider>
  );
}
