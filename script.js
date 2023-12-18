document.getElementById("cards").onmousemove = (e) => {
  for (const card of document.getElementsByClassName("card")) {
    const rect = card.getBoundingClientRect(),
      x = e.clientX - rect.left,
      y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  }
};

var margin = {top: 10, right: 30, bottom: 30, left: 30},
width = 460 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

var tooltip = d3.select("#scatterplot")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "rgb(25,25,25)")
  .style("width", "125px")
  .style("border", "solid")
  .style("z-index", "4")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("position", "relative")
  .style("pointer-events", "none")
  .style("font-size", "16px")
  .style("line-height", "20px")

var SVG = d3.select("#scatterplot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.csv("https://raw.githubusercontent.com/bsilver3/DataScience1/main/Projects/FinalProject/SaccadesDataset-PostAnalysis.csv", function(data) {

  SVG.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height - 6)
    .text("Amplitude");

  SVG.append("text")
    .attr("text-anchor", "end")
    .attr("y", 6)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Velocity");

  d3.selectAll("text").attr("fill", "white");

  var x = d3.scaleLinear()
    .domain([0, 50])
    .range([ 0, width ]);
  var xAxis = SVG.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "axisWhite")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, 3500])
    .range([ height, 0]);
  var yAxis = SVG.append("g")
    .attr("class", "axisWhite")
    .call(d3.axisLeft(y));

  var clip = SVG.append("defs").append("SVG:clipPath")
    .attr("id", "clip")
    .append("SVG:rect")
    .attr("width", width )
    .attr("height", height )
    .attr("x", 0)
    .attr("y", 0);

  var scatter = SVG.append('g')
    .attr("clip-path", "url(#clip)")

  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
      .style("left", (d3.mouse(this)[0]+90) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  var mousemove = function(d) {
    tooltip
      .html("Amplitude: " + d.Amplitude + "<br>Velocity: " + d.Velocity)
      .style("left", (d3.mouse(this)[0]+90) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }

  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }

  scatter
    .selectAll("dot")
    .data(data.filter(function(d,i){return i<35000}))
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.Amplitude); } )
      .attr("cy", function (d) { return y(d.Velocity); } )
      .attr("r", 5)
      .attr("z-index", 5)
      .style("fill", "rgb(45, 165, 195)")
      .style("opacity", 0.5)
    .on("mouseover", mouseover )
    .on("mousemove", mousemove )
    .on("mouseleave", mouseleave )

  var zoom = d3.zoom()
    .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
    .extent([[0, 0], [width, height]])
    .on("zoom", updateChart);

  SVG.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    // .style("pointer-events", "all")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(zoom);

  function updateChart() {
    // recover the new scale
    var newX = d3.event.transform.rescaleX(x);
    var newY = d3.event.transform.rescaleY(y);

    // update axes with these new boundaries
    xAxis.call(d3.axisBottom(newX))
    yAxis.call(d3.axisLeft(newY))

      // update circle position
    scatter
      .selectAll("circle")
      .attr('cx', function(d) {return newX(d.Amplitude)})
      .attr('cy', function(d) {return newY(d.Velocity)});
  }
})