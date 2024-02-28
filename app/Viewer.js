import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export default function Viewer(containerEl, data) {
  const container = d3.select(containerEl);

  function computeUsefulGroupingKeys(data) {
    // count frequency of unique values for all fields in data
    // outputs a list of valid keys
    const size = data.length;
    const threshold = 0.05;

    const keysValues = data.reduce((acc, d) => {
      Object.keys(d).forEach((key) => {
        if (acc[key]) {
          acc[key].add(d[key]);
        } else {
          acc[key] = new Set([d[key]]);
        }
      });
      return acc;
    }, {});

    // filter keysValues to only include keys whose length / size is less than threshold
    // if less than 250, just return all keys
    if (size <= 250) {
      return Object.keys(keysValues);
    } else {
      return Object.entries(keysValues)
        .filter(([key, values]) => values.size / size < threshold)
        .map(([key, values]) => key);
    }
  }
  const validKeys = computeUsefulGroupingKeys(data).sort();

  function drawSelect(selection, data) {
    const select = selection
      .append("select")
      .classed("text-xs", true)
      .classed("border-l pl-1", true)
      .on("change", (e) => {
        const key = e.target.value;
        if (key && validKeys.includes(key)) {
          // 1. first group by the seleced groupingValue, one of above validKeys
          // 2. then sort the groups by the length of the group
          const count = data.length;
          const _data = d3.group(data, (d) => d[key]);
          const _dataSorted = Array.from(_data).sort(
            (a, b) => b[1].length - a[1].length
          );
          drawSection(d3.select(selection.node().parentNode), {
            data: _dataSorted,
            count: count,
            key: key,
          });
        }
      });

    select
      .selectAll("option")
      .data(validKeys)
      .enter()
      .append("option")
      .attr("value", (d) => d)
      .text((d) => d);

    // append the default option
    select.append("option").text("Split by ▼").attr("selected", true);
    return select;
  }

  function addFilter(parentKey, k, title) {
    const filteredData = data.filter((d) => d[parentKey] === k);
    drawSection(container, {
      data: filteredData,
      count: filteredData.length,
      key: `<i class='fa fa-filter'></i> ${parentKey}=${k}`,
    });
  }

  function buildNestedDefinition(selection, parentCount, parentKey) {
    selection.each(function ([k, d]) {
      const container = d3
        .select(this)
        .append("div")
        .classed("flex info items-center gap-2", true);

      container
        .append("span")
        .classed("ordinal slashed-zero tabular-nums text-xs w-14", true)
        .text(d.length);
      container
        .append("span")
        .classed("ordinal slashed-zero tabular-nums text-xs w-14", true)
        .text(((d.length / parentCount) * 100).toFixed(2) + "%");
      container
        .append("span")
        .text(k)
        .classed("key px-1 hover:bg-gray-100 hover:cursor-pointer", true)
        .on("click", function (e, [key, d]) {
          globalThis.perspectiveViewer.buildViewer(d, key);
        });

      container.append("span").classed("flex-1", true);

      drawSelect(container, d);

      container
        .append("span")
        .classed("border-l pl-1", true)
        .html("<i class='fa fa-filter hover:rotate-45'></i>")
        .on("click", (e, [k, v]) => {
          addFilter(parentKey, k);
        });
    });
  }

  function drawSection(container, configs) {
    let { data, count, key } = configs;
    key = key || "no";
    // main box
    const view = container.append("div").classed("view", true);
    view.classed("p-2 m-2 border", true);

    // current selection
    const selection = view
      .append("details")
      .classed("selection", true)
      .attr("open", true);

    const heading = selection
      .append("summary")
      .classed("heading flex justify-between", true)
      .classed("sticky top-0", true)
      .classed("hover:bg-gray-50 hover:cursor-pointer", true);

    heading.append("h2").classed("bg-slate-200", true).html(`${key} selection`);
    heading
      .append("span")
      .classed(
        "close underline px-1 text-xs text-red-500 hover:cursor-pointer hover:text-black",
        true
      )
      .text("ⅹ")
      .on("mouseover", () => {
        view.style("opacity", 0.4);
      })
      .on("mouseout", () => {
        view.style("opacity", 1);
      })
      .on("click", () => {
        view.remove();
      });

    if (validKeys.includes(key)) {
      // List of items, passing along to <GroupingList>
      const groups = selection
        .append("div")
        .classed("flex flex-col", true)
        .selectAll("div")
        .data(data)
        .enter()
        .append("div")
        .classed("border-b p-1", true);

      groups.each(function (d, i) {
        buildNestedDefinition(d3.select(this), count, key);
      });
    } else {
      drawSelect(selection, data);
    }
  }

  drawSection(container, { data: data, count: data.length });
}
