import type {
  FrontendRenderer,
  FrontendRendererArgs,
} from "@streamlit/component-v2-lib";
import { createRoot, type Root } from "react-dom/client";
import App from "./App";
import { ThemeRoot } from "./ThemeRoot";
import { EmbeddedTransport } from "./embeddedTransport";
import type { HostRequest } from "./embeddedTransport";
import { configureEmbeddedTransport } from "./transport";
import { configureWorkspaceRoot } from "./workspaceDom";
import styles from "./styles.css?inline";

type State = { requests: HostRequest[] };
type Data = { generation: string; responses: unknown };
type Mounted = { root: Root; transport: EmbeddedTransport };
const mounts = new WeakMap<FrontendRendererArgs["parentElement"], Mounted>();

const render: FrontendRenderer<State, Data> = ({
  parentElement,
  data,
  setStateValue,
}) => {
  let mounted = mounts.get(parentElement);
  if (mounted && mounted.transport.generation !== data.generation) {
    mounted.root.unmount();
    mounted.transport.dispose();
    mounts.delete(parentElement);
    mounted = undefined;
  }
  if (!mounted) {
    const container = parentElement.querySelector<HTMLElement>(".react-root");
    if (!container) throw new Error("Workspace mount unavailable");
    const sheet = document.createElement("style");
    sheet.textContent = styles;
    parentElement.prepend(sheet);
    configureWorkspaceRoot(parentElement);
    const transport = new EmbeddedTransport(data.generation, (requests) =>
      setStateValue("requests", requests),
    );
    configureEmbeddedTransport(data.generation, transport.request);
    const root = createRoot(container);
    mounted = { root, transport };
    mounts.set(parentElement, mounted);
    root.render(
      <ThemeRoot>
        <div className="embeddedWorkspace">
          <div className="hostingNotice">
            <span>TESTING WORKSPACE</span>
            <span>
              Synthetic data only · saved test cases may reset when the host
              restarts
            </span>
          </div>
          <App />
        </div>
      </ThemeRoot>,
    );
  }
  mounted.transport.publish = (requests) => setStateValue("requests", requests);
  mounted.transport.accept(data.responses);
  return () => {
    const current = mounts.get(parentElement);
    current?.root.unmount();
    current?.transport.dispose();
    mounts.delete(parentElement);
  };
};

export default render;
