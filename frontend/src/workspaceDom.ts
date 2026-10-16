let root: ParentNode = document;

export function configureWorkspaceRoot(value: ParentNode): void {
  root = value;
}
export function queryWorkspace<T extends Element>(selector: string): T | null {
  return root.querySelector<T>(selector);
}
export function activeWorkspaceElement(element: Element): Element | null {
  const node = element.getRootNode();
  return node instanceof ShadowRoot
    ? node.activeElement
    : document.activeElement;
}
