export function getContainerElementForDownload(id: string): HTMLDivElement {
  let container = document.getElementById(id) as HTMLDivElement | null;

  if (container) {
    return container;
  }

  container = document.createElement("div");
  container.id = id;
  container.style.display = "none";

  document.body.appendChild(container);

  return container;
}
