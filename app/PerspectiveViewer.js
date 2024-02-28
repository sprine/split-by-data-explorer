import perspective from "https://cdn.jsdelivr.net/npm/@finos/perspective@2.8.0/dist/cdn/perspective.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let lastConfig = {};

export default class PerspectiveViewer {
  constructor(containerEl) {
    console.log("new PerspectiveViewer");
    this.perspectiveContainer = containerEl;
  }

  close() {
    this.perspectiveContainer.classList.add("hidden");
  }

  show() {
    this.perspectiveContainer.classList.remove("hidden");
  }

  buildViewer(data, title) {
    if (!data || data.length === 0) {
      this.close();
      return;
    }

    this.perspectiveContainer.innerHTML = "";
    // 1. clear out this.perspectiveContainer
    const header = d3
      .select(this.perspectiveContainer)
      .append("div")
      .classed("text-right", true);

    header
      .append("span")
      .classed(
        "text-[8pt] px-2 text-gray-500 hover:text-black hover:cursor-pointer underline",
        true
      )
      .html("[<i class='fa fa-expand'></i>] full")
      .on("click", () => {
        this.perspectiveContainer.classList.toggle("h-[100vh]");
      });

    header
      .append("span")
      .classed(
        "text-[8pt] px-2 text-gray-500 hover:text-red-500 hover:cursor-pointer underline",
        true
      )
      .html("[x] close")
      .on("click", () => this.close());

    // 2. create perspective viewer in this.perspectiveContainer
    // create new <perspective-viewer> element
    const viewer = document.createElement("perspective-viewer");
    viewer.setAttribute("class", "w-full h-full");
    const worker = perspective.worker();
    // Create a table in this worker
    const table = worker.table(data);
    viewer.load(table);
    viewer.restore(Object.assign({}, lastConfig, { title: title }));

    viewer.addEventListener(
      "perspective-config-update",
      async function (event) {
        console.log("before: ");
        console.log(lastConfig);
        lastConfig = await viewer.save();
        console.log("after: ");
        console.log(lastConfig);
      }
    );

    this.perspectiveContainer.appendChild(viewer);
    this.show();
  }
}
