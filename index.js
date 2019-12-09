Promise.all([
  d3.json(
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json"
  ),
  d3.json(
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json"
  ),
  d3.json(
    "https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json"
  )
]).then(allData => {
  [gameData, movieData, kickstarterData] = allData;
  const DATASETS = {
    games: {
      title: "video game sales",
      description: "Video Game Sales Data Top 100",
      url: gameData
    },
    movies: {
      title: "movie sales",
      description: "Top movie by genre",
      url: movieData
    },
    kickstarters: {
      title: "kickstarter pledges",
      description: "Top kickstarter pledges by category",
      url: kickstarterData
    }
  };

  d3.selectAll("input").on("click", function() {
    var tagvalue = d3.select(this).attr("value");
    renderTitles(tagvalue);
  });

  var svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", 1100)
    .attr("height", 700);
  var treemapLayout = d3
    .treemap()
    .size([1100, 700])
    .padding(1);
  var toolTip = d3
    .select("main")
    .append("div")
    .attr("id", "tooltip");

  function renderTitles(name) {
    document.querySelector("h2").textContent = DATASETS[name].title;
    document.querySelector("h3").textContent = DATASETS[name].description;
    renderTreemap(DATASETS[name].url);
  }

  function renderTreemap(url) {
    d3.selectAll("g").remove();

    var categoryNames = [];
    for (var i = 0; i < url.children.length; i++) {
      categoryNames.push(url.children[i].name);
    }

    var root = d3
      .hierarchy(url)
      .sum(d => d.value)
      .sort((a, b) => b.height - a.height || b.value - a.value);
    treemapLayout(root);

    var colors = [
      "aqua",
      "blue",
      "blueviolet",
      "chocolate",
      "cadetblue",
      "darkorange",
      "red",
      "teal",
      "deeppink",
      "purple",
      "forestgreen",
      "gold",
      "olive",
      "rosybrown",
      "tomato",
      "burlywood",
      "bisque",
      "chartreuse",
      "darkcyan"
    ]; // must be 19 unique colors
    var fillColor = d3
      .scaleOrdinal()
      .domain(categoryNames)
      .range(colors);

    var nodes = svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0}, ${d.y0})`)
      .on("mousemove", function(d) {
        toolTip.html(
          `<p>Name: ${d.data.name}</p><br><p>Category: ${
            d.data.category
          }</p><br><p>Value: ${d.data.value}</p>`
        );
        toolTip.attr("data-value", d.data.value);
        toolTip
          .style("display", "inline-block")
          .style("left", d3.event.pageX + 8 + "px")
          .style("top", d3.event.pageY + 10 + "px");
      })
      .on("mouseout", function() {
        toolTip.style("display", "none");
      });

    nodes
      .append("rect")
      .classed("tile", true)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .style("fill", d => fillColor(d.data.category));

    nodes
      .append("text")
      .selectAll("tspan")
      .data(d => d.data.name.split(" "))
      .enter()
      .append("tspan")
      .attr("x", 1)
      .attr("y", (d, i) => i * 16 + 15)
      .text(d => d)
      .style("font-size", "small");

    renderLegend(colors, categoryNames, fillColor);
  }

  var legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", 1100)
    .attr("height", 400)
    .attr("transform", `translate(0, ${50})`);

  function renderLegend(colors, categoryNames, fillColor) {
    var legMid = 550;
    var legX = 700;
    var rectWH = 15;
    var marginTop = 40;
    var rectOffY = 25;
    var textOffX = 12 - rectWH;
    var rectColDist = 1100 / 4;

    d3.selectAll(".legend-item").remove();
    d3.selectAll("#legend-text").remove();

    function adjustX(multiplier) {
      if (multiplier == 0) {
        return multiplier * rectColDist + rectColDist;
      } else if (multiplier == 1) {
        return legMid;
      } else {
        return multiplier * rectColDist + rectColDist;
      }
    }

    function adjustY(i) {
      return Math.floor(i / 3) * rectWH + rectOffY * Math.floor(i / 3);
    }

    var boxes = legend
      .selectAll("rect")
      .data(categoryNames)
      .enter()
      .append("rect")
      .attr("x", (d, i) => {
        var multiplier = i % 3; // will return 0 1 2 every time
        return adjustX(multiplier);
      })
      .attr("y", (d, i) => adjustY(i))
      .attr("width", rectWH)
      .attr("height", rectWH)
      .classed("legend-item", true)
      .style("fill", d => fillColor(d));

    var text = legend
      .selectAll("text")
      .data(categoryNames)
      .enter()
      .append("text")
      .attr("x", (d, i) => {
        var multiplier = i % 3; // will return 0 1 2 every time
        return adjustX(multiplier) + 25;
      })
      .attr("y", (d, i) => adjustY(i) + 15)
      .attr("id", "legend-text")
      .text(d => d)
      .style("font-size", "bigger");
  }

  d3.select(document).on("DOMContentLoaded", renderTitles("games"));
});
