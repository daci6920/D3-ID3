export const headerHTML = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <title>Scatter Plot</title>
</head>

<body>
  <script src="https://d3js.org/d3.v4.min.js"></script>
  <script id="mainScript">
    var scatter =`;

export const atBottom =  (`;function responsivefy(svg, boolean) {
      if (boolean) {
        // get container + svg aspect ratio
        let container = d3.select(svg.node().parentNode),
          width = parseInt(svg.style("width")),
          height = parseInt(svg.style("height")),
          aspect = width / height;

        // add viewBox and preserveAspectRatio properties,
        // and call resize so that svg resizes on inital page load
        svg.attr("viewBox", "0 0 " + width + " " + height)
          .attr("perserveAspectRatio", "xMinYMid")
          .call(resize);

        // to register multiple listeners for same event type, 
        // you need to add namespace, i.e., 'click.foo'
        // necessary if you call invoke this function for multiple svgs
        // api docs: https://github.com/mbostock/d3/wiki/Selections#on
        d3.select(window).on("resize." + container.attr("id"), resize);

        // get width of container and resize svg to fit it
        function resize() {
          let targetWidth = parseInt(container.style("width"));
          svg.attr("width", targetWidth);
          svg.attr("height", Math.round(targetWidth / aspect));
        }
      } else {
        d3.select(window).on("resize." + d3.select(svg.node().parentNode).attr("id"), null);
      }
    }

    function create_data(xValues, yValues) {
      let x = xValues;
      let y = yValues;

      if (x === null) {
        x = [];
        for (let i = 0; i < 100; i += 1) {
          x.push(i);
        }
      }

      if (y === null) {
        y = [];
        for (let i = 0; i < 100; i += 1) {
          y.push(Math.floor(Math.random() * 100));
        }
      }

      let formatTime = d3.timeFormat("%B %d, %Y");
      let parseTime = d3.timeParse("%B %d, %Y");
      // console.log(parseTime(formatTime(new Date("2016-04-02"))));

      const data = [];
      for (let i = 0; i < y.length; i += 1) {
        let obj = {};

        if (isNaN(+x[i])) {
          obj.xType = 'date';
          obj.x = parseTime(formatTime(new Date(x[i])));
        } else {
          obj.x = +x[i];
        }
        if (isNaN(+y[i])) {
          obj.yType = 'date';
          obj.y = parseTime(formatTime(new Date(y[i])));
        } else {
          obj.y = +y[i];
        }
        // obj.x = +x[i];
        // obj.y = +y[i];
        data.push(obj);
      }
      return data;
    }

    function createSvg(settings) {
      const svgContainer = document.createElement("div");
      svgContainer.setAttribute("id", "svgContainer");
      document.body.insertBefore(svgContainer, document.body.firstChild);
      let svg = d3.select(svgContainer).insert("svg", ":first-child")
        .attr("id", "svg")
        .attr("width", settings.width)
        .attr("height", settings.height)
        .call(responsivefy, settings.responsiveResize)
        .append("g")
        .attr("class", "graph")
        .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")");

      return svg;
    }

    function createScatterPlot(svg, settings) {
      let xScale;
      let yScale;
      // let xTime = false;
      // let yTime = false;

      // console.log(Object.prototype.toString.call(settings.data[0].x === '[object Date]'));

      if (settings.data[0].xType === 'date') {
        // xTime = true;
        xScale = d3.scaleTime();
      }
      if (!settings.data[0].xType) {
        xScale = d3.scaleLinear();
      }

      if (settings.data[0].yType === 'date') {
        // yTime = true;
        yScale = d3.scaleTime();
      }
      if (!settings.data[0].yType) {
        yScale = d3.scaleLinear();
      }

      // xScale = d3.scaleLinear();
      // yScale = d3.scaleLinear();

      xScale
        .domain(d3.extent(settings.data, d => { return d.x }))
        .range([0, settings.width - settings.margin.left - settings.margin.right])
        .nice();

      yScale
        .domain(d3.extent(settings.data, d => { return d.y }))
        .range([settings.height - settings.margin.top - settings.margin.bottom, 0])
        .nice();

      let plot = {
        xScale: xScale,
        yScale: yScale,
      }

      return plot;
    }

    function createAxis(svg, settings, plot) {
      if (settings.axes.xAxis.exist) {
        let xAxis = svg.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + (settings.height - settings.margin.top - settings.margin.bottom) + ")")

        if (settings.data[0].xType === 'date') {
          xAxis
            .call(d3.axisBottom(plot.xScale)
              .tickFormat(d3.timeFormat("%B %d, %Y"))
              .ticks(settings.axes.xAxis.ticks));
        } else {
          xAxis
            .call(d3.axisBottom(plot.xScale)
              .ticks(settings.axes.xAxis.ticks));
        }

        // xAxis
        //   .call(d3.axisBottom(plot.xScale)
        //     .ticks(settings.axes.xAxis.ticks));

        xAxis.selectAll(".x-axis line")
          .style("stroke", settings.axes.xAxis.axisColor);

        xAxis.selectAll(".x-axis path")
          .style("stroke", settings.axes.xAxis.axisColor);

        xAxis.selectAll("text")
          .style("stroke", "none")
          .style("fill", settings.axes.xAxis.nameColor);

        xAxis.append("text")
          .attr("class", "xlabel label")
          .attr("x", (settings.width - settings.margin.left - settings.margin.right))
          .attr("y", -6)
          .style("text-anchor", "end")
          .style("fill", settings.axes.xAxis.nameColor)
          .text(settings.axes.xAxis.name);

        plot.xAxis = xAxis;
      }

      if (settings.axes.yAxis.exist) {
        let yAxis = svg.append("g")
          .attr("class", "y-axis")

        if (settings.data[0].yType === 'date') {
          yAxis
            .call(d3.axisLeft(plot.yScale)
              .tickFormat(d3.timeFormat("%B %d, %Y"))
              .ticks(settings.axes.yAxis.ticks));
        } else {
          yAxis
            .call(d3.axisLeft(plot.yScale)
              .ticks(settings.axes.yAxis.ticks));
        }

        // yAxis
        //   .call(d3.axisLeft(plot.yScale)
        //     .ticks(settings.axes.yAxis.ticks));

        yAxis.selectAll(".y-axis line")
          .style("stroke", settings.axes.yAxis.axisColor);

        yAxis.selectAll(".y-axis path")
          .style("stroke", settings.axes.yAxis.axisColor);

        yAxis.selectAll("text")
          .style("stroke", "none")
          .style("fill", settings.axes.yAxis.nameColor);

        yAxis.append("text")
          .attr("class", "ylabel label")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .style("fill", settings.axes.yAxis.nameColor)
          .text(settings.axes.yAxis.name);

        plot.yAxis = yAxis;
      }
    }

    function plotPoints(svg, settings, plot) {
      if (scatter.scatterPlot.points.entryDelayEach > 0) {
        svg.selectAll(".point")
          .data(settings.data)
          .enter().append("circle")
          .attr("class", "point")
          .each(function (d, i) {
            d3.select(this).transition()
              .delay(i * scatter.scatterPlot.points.entryDelayEach)
              .attr("r", settings.scatterPlot.points.radius)
              .attr("fill", settings.scatterPlot.points.color)
              .attr("cx", plot.xScale(d.x))
              .attr("cy", plot.yScale(d.y));
          });
      } else if (scatter.scatterPlot.points.entryDelayEach === 0) {
        svg.selectAll(".point")
          .data(settings.data)
          .enter().append("circle")
          .attr("class", "point")
          .attr("r", settings.scatterPlot.points.radius)
          .attr("fill", settings.scatterPlot.points.color)
          .attr("cx", function (d) {
            return plot.xScale(d.x);
          })
          .attr("cy", function (d) {
            return plot.yScale(d.y);
          });
      }
      if (settings.toolTip.exist) {
        let toolTip = d3.select('#svgContainer')
          .append('div')
          .attr('class', 'toolTip')
          .style('border', settings.toolTip.border)
          .style('padding', settings.toolTip.padding + 'px')
          .style('position', 'absolute')
          .style('display', 'none');

        svg.selectAll(".point")
          .on('mouseover', function (d, i) {
            toolTip.text(settings.toolTip.text + d.x + ", " + d.y)
              .style("text-anchor", "middle")
              .attr("dy", -10)
              .transition().duration(0)
              .style('top', (d3.event.pageY - 28) + 'px')
              .style('left', (d3.event.pageX + 5) + 'px')
              .style('display', 'block');
          })
          .on('mouseout', function (d, i) {
            toolTip.transition()
              .delay(500)
              .style('display', 'none');
          });
      }
    }

    function createGridLines(svg, settings) {
      if (settings.gridLines.exist) {
        svg.selectAll("g.x-axis g.tick")
          .append("line")
          .classed("grid-line", true)
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", -(settings.height - settings.margin.top - settings.margin.bottom))
          .attr("fill", "none")
          .attr("stroke", settings.gridLines.verticalColor)
          .attr("stroke-width", settings.gridLines.verticalWidth + "px");
        svg.selectAll("g.y-axis g.tick")
          .append("line")
          .classed("grid-line", true)
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", settings.width - settings.margin.left - settings.margin.right)
          .attr("y2", 0)
          .attr("fill", "none")
          .attr("stroke", settings.gridLines.horizontalColor)
          .attr("stroke-width", settings.gridLines.horizontalWidth + "px");
      }
    }

    function regress(data) {
      let yhat = [];
      let x_mean = 0;
      let y_mean = 0;
      let term1 = 0;
      let term2 = 0;
      // calculate mean x and y
      data.forEach(obj => {
        obj.x = +obj.x;
        obj.y = +obj.y;
        x_mean += obj.x;
        y_mean += obj.y;
      });

      x_mean /= data.length;
      y_mean /= data.length;

      // calculate coefficients
      let xr = 0;
      let yr = 0;
      data.forEach(obj => {
        xr = obj.x - x_mean;
        yr = obj.y - y_mean;
        term1 += xr * yr;
        term2 += xr * xr;
      });

      // perform regression 
      let b1 = term1 / term2;
      let b0 = y_mean - (b1 * x_mean);

      // fit line using coeffs
      data.forEach(obj => {
        yhat.push(b0 + (obj.x * b1));
      });
      return yhat;
    }

    function checkRegressionLine(svg, settings, plot) {
      if (settings.regressionLine.exist) {
        svg.select(".regressionLine").remove();
        const yhat = regress(settings.data);
        settings.data.forEach((obj, i) => {
          obj.yhat = yhat[i];
        });
        let line = d3.line()
          .x(function (d) {
            return plot.xScale(d.x);
          })
          .y(function (d) {
            return plot.yScale(d.yhat);
          });

        svg.append("path")
          .datum(settings.data)
          .attr("class", "regressionLine")
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", settings.regressionLine.color)
          .attr("stroke-width", settings.regressionLine.width + "px");
      }
    }

    var updatePlot =  function(svg, settings, plot) {
      let width = parseInt(d3.select('svg').style("width"));
      let height = parseInt(d3.select('svg').style("height"));
      d3.select('svg')//.attr("viewBox", "0 0 " + width + " " + height)
        //.attr("perserveAspectRatio", "xMinYMid")
        .attr("width", settings.width)
        .attr("height", settings.height)
        .call(responsivefy, settings.responsiveResize);
      d3.select('.graph')
        .attr("transform", "translate(" + settings.margin.left + "," + settings.margin.top + ")");

      plot.xScale.domain(d3.extent(settings.data, d => { return d.x }))
        .range([0, settings.width - settings.margin.left - settings.margin.right])
        .nice();
      plot.yScale.domain(d3.extent(settings.data, d => { return d.y }))
        .range([settings.height - settings.margin.top - settings.margin.bottom, 0])
        .nice();

      var newData = svg.selectAll("circle").data(settings.data);

      newData.enter().append("circle").attr("class", "point");

      if (settings.toolTip.exist) {
        let toolTip = d3.select('#svgContainer')
          .append('div')
          .attr('class', 'toolTip')
          .style('border', settings.toolTip.border)
          .style('padding', settings.toolTip.padding + 'px')
          .style('position', 'absolute')
          .style('display', 'none');

        svg.selectAll(".point")
          .on('mouseover', function (d, i) {
            toolTip.text(settings.toolTip.text + d.x + ", " + d.y)
              .style("text-anchor", "middle")
              .attr("dy", -10)
              .transition().duration(0)
              .style('top', (d3.event.pageY - 28) + 'px')
              .style('left', (d3.event.pageX + 5) + 'px')
              .style('display', 'block');
          })
          .on('mouseout', function (d, i) {
            toolTip.transition()
              .delay(500)
              .style('display', 'none');
          });
      }

      // Update circles
      svg.selectAll("circle")
        //.data(settings.data)  // Update with new data
        .transition()  // Transition from old to new
        .duration(1000)  // Length of animation
        .on("start", function () {  // Start animation
          d3.select(this)  // 'this' means the current element
            .attr("fill", settings.scatterPlot.points.transitionAnimation.color)  // Change color
            .attr("r", settings.scatterPlot.points.transitionAnimation.radius);  // Change size
        })
        .delay(function (d, i) {
          return i / settings.data.length * 500;  // Dynamic delay (i.e. each item delays a little longer)
        })
        .ease(d3.easeLinear)  // Transition easing - default 'variable' (i.e. has acceleration), also: 'circle', 'elastic', 'bounce', 'linear'
        .attr("cx", function (d) {
          return plot.xScale(d.x);  // Circle's X
        })
        .attr("cy", function (d) {
          return plot.yScale(d.y);  // Circle's Y
        })
        .on("end", function () {  // End animation
          d3.select(this)  // 'this' means the current element
            .transition()
            .duration(500)
            .attr("fill", settings.scatterPlot.points.color)  // Change color
            .attr("r", settings.scatterPlot.points.radius)  // Change radius
        });

      newData.exit().remove();

      // Update X Axis
      if (settings.axes.xAxis.exist) {
        if (settings.data[0].xType === 'date') {
          plot.xAxis
            .transition()
            .duration(1000)
            .attr("transform", "translate(0," + (settings.height - settings.margin.top - settings.margin.bottom) + ")")
            .call(d3.axisBottom(plot.xScale)
              .tickFormat(d3.timeFormat("%B %d, %Y"))
              .ticks(settings.axes.xAxis.ticks))
            .select(".xlabel")
            .attr("x", (settings.width - settings.margin.left - settings.margin.right))
            .style("fill", settings.axes.xAxis.nameColor)
            .text(settings.axes.xAxis.name);
          plot.xAxis
            .selectAll(".x-axis path")
            .style("stroke", settings.axes.xAxis.axisColor);
          plot.xAxis
            .selectAll(".x-axis line")
            .style("stroke", settings.axes.xAxis.axisColor);

        } else {
          plot.xAxis
            .transition()
            .duration(1000)
            .attr("transform", "translate(0," + (settings.height - settings.margin.top - settings.margin.bottom) + ")")
            .call(d3.axisBottom(plot.xScale)
              .ticks(settings.axes.xAxis.ticks))
            .select(".xlabel")
            .attr("x", (settings.width - settings.margin.left - settings.margin.right))
            .style("fill", settings.axes.xAxis.nameColor)
            .text(settings.axes.xAxis.name);
          plot.xAxis
            .selectAll(".x-axis path")
            .style("stroke", settings.axes.xAxis.axisColor);
          plot.xAxis
            .selectAll(".x-axis line")
            .style("stroke", settings.axes.xAxis.axisColor);
          // plot.xAxis
          //   .selectAll('.tick text')
          //   .style("fill", settings.axes.xAxis.nameColor);
        }
      }

      // Update Y Axis

      if (settings.axes.yAxis.exist) {
        if (settings.data[0].yType === 'date') {
          plot.yAxis
            .transition()
            .duration(1000)
            .call(d3.axisLeft(plot.yScale)
              .tickFormat(d3.timeFormat("%B %d, %Y"))
              .ticks(settings.axes.yAxis.ticks))
            .select(".ylabel")
            .style("fill", settings.axes.yAxis.nameColor)
            .text(settings.axes.yAxis.name);
          plot.yAxis
            .selectAll(".y-axis path")
            .style("stroke", settings.axes.yAxis.axisColor);
          plot.yAxis
            .selectAll(".y-axis line")
            .style("stroke", settings.axes.yAxis.axisColor);

        } else {
          plot.yAxis
            .transition()
            .duration(1000)
            .call(d3.axisLeft(plot.yScale)
              .ticks(settings.axes.yAxis.ticks))
            .select(".ylabel")
            .style("fill", settings.axes.yAxis.nameColor)
            .text(settings.axes.yAxis.name);
          plot.yAxis
            .selectAll(".y-axis path")
            .style("stroke", settings.axes.yAxis.axisColor);
          plot.yAxis
            .selectAll(".y-axis line")
            .style("stroke", settings.axes.yAxis.axisColor);
        }
      }
    }

    if (!scatter.data) {
      scatter.data = create_data(null, null);
    }

    if (isNaN(+scatter.data[0].x) || isNaN(+scatter.data[0].y)) {
      let xArray = [];
      let yArray = [];

      scatter.data.forEach(obj => {
        xArray.push(obj.x);
        yArray.push(obj.y);
      });

      scatter.data = create_data(xArray, yArray);
    }

    var svg = createSvg(scatter);
    var plot = createScatterPlot(svg, scatter);
    createAxis(svg, scatter, plot);
    createGridLines(svg, scatter);
    checkRegressionLine(svg, scatter, plot);
    plotPoints(svg, scatter, plot);

    document.addEventListener("DOMContentLoaded", function (event) {
      const settingsArea = document.createElement("textarea");
      settingsArea.setAttribute("id", "settingsArea");
      settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
      settingsArea.setAttribute("style", "width:250px;height:250px;");

      const updateButton = document.createElement("button");
      updateButton.innerHTML = "New data!";
      document.body.appendChild(updateButton);
      updateButton.addEventListener("click", (e) => {
        scatter.data = create_data(null, null);
        if (scatter.regressionLine.exist) {
          svg.selectAll(".regressionLine").remove();
        }
        if (scatter.gridLines.exist) {
          svg.selectAll(".x-axis").remove();
          svg.selectAll(".y-axis").remove();
          svg.selectAll(".grid-line").remove();
          createAxis(svg, scatter, plot);
        }
        updatePlot(svg, scatter, plot);
        createGridLines(svg, scatter);
        checkRegressionLine(svg, scatter, plot);
        settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
      });

      document.body.appendChild(document.createElement("br"));

      const importCsvTsvButton = document.createElement("input");
      importCsvTsvButton.setAttribute("id", "importCsvTsv");
      importCsvTsvButton.setAttribute("type", "file");
      importCsvTsvButton.setAttribute("accept", ".csv,.tsv");
      const importCsvTsvLabel = document.createElement("label");
      importCsvTsvLabel.innerHTML = "Import data (.csv, .tsv):" + "\t";
      document.body.appendChild(importCsvTsvLabel);
      importCsvTsvLabel.appendChild(importCsvTsvButton);
      importCsvTsvLabel.appendChild(document.createElement("br"));
      importCsvTsvButton.addEventListener("change", (e) => {
        const input = importCsvTsvButton;
        const reader = new FileReader();
        reader.onload = function () {
          let separator = '';
          if (input.files[0].type === "text/csv") {
            separator = ',';
            
          }
          if (input.files[0].type === "text/tab-separated-values") {
            separator = ' ';
            
          }
          let headers = scatter.data[0].split(separator);
          scatter.axes.xAxis.name = headers[0];
          scatter.axes.yAxis.name = headers[1];
          let xArray = [];
          let yArray = [];
          for (let i = 1; i < scatter.data.length; i += 1) {
            let values = scatter.data[i].split(separator);
            xArray.push(values[0]);
            yArray.push(values[1]);
          }
          scatter.data = create_data(xArray, yArray);
          settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
          // document.body.removeChild(document.getElementById("svgContainer"));
          // svg = createSvg(scatter);
          // plot = createScatterPlot(svg, scatter);
          // createAxis(svg, scatter, plot);
          // createGridLines(svg, scatter);
          // checkRegressionLine(svg, scatter, plot);
          // plotPoints(svg, scatter, plot);
          if (scatter.regressionLine.exist) {
            svg.selectAll(".regressionLine").remove();
          }
          if (scatter.gridLines.exist) {
            svg.selectAll(".x-axis").remove();
            svg.selectAll(".y-axis").remove();
            svg.selectAll(".grid-line").remove();
            createAxis(svg, scatter, plot);
          }
          updatePlot(svg, scatter, plot);
          createGridLines(svg, scatter);
          checkRegressionLine(svg, scatter, plot);
        };
        reader.readAsText(input.files[0]);
      });

      const importJsonForm = document.createElement("form");
      importJsonForm.setAttribute("id", "importJsonForm");
      const xJsonKeyLabel = document.createElement("label");
      xJsonKeyLabel.innerHTML = "JSON x-value key" + "\t";
      const xJsonKeyInput = document.createElement("input");
      xJsonKeyInput.setAttribute("id", "xJsonKeyInput");
      xJsonKeyInput.setAttribute("type", "text");
      xJsonKeyInput.setAttribute("value", "x");
      const yJsonKeyLabel = document.createElement("label");
      yJsonKeyLabel.innerHTML = "JSON y-value key" + "\t";
      const yJsonKeyInput = document.createElement("input");
      yJsonKeyInput.setAttribute("id", "yJsonKeyInput");
      yJsonKeyInput.setAttribute("type", "text");
      yJsonKeyInput.setAttribute("value", "y");
      const importJsonSubmit = document.createElement("input");
      importJsonSubmit.setAttribute("type", "submit");
      importJsonSubmit.setAttribute("value", "Submit JSON keys");
      const importJsonButton = document.createElement("input");
      importJsonButton.setAttribute("id", "importJson");
      importJsonButton.setAttribute("type", "file");
      importJsonButton.setAttribute("accept", ".json");
      const importJsonLabel = document.createElement("label");
      importJsonLabel.innerHTML = "Import data (array of objects .json):" + "\t";
      document.body.appendChild(importJsonForm);
      importJsonForm.appendChild(importJsonLabel);
      importJsonLabel.appendChild(importJsonButton);
      importJsonLabel.appendChild(document.createElement("br"));
      importJsonForm.appendChild(xJsonKeyLabel);
      xJsonKeyLabel.appendChild(xJsonKeyInput);
      importJsonForm.appendChild(yJsonKeyLabel);
      yJsonKeyLabel.appendChild(yJsonKeyInput);
      importJsonForm.appendChild(importJsonSubmit);

      importJsonForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = importJsonButton;
        const reader = new FileReader();
        reader.onload = function () {
          scatter.data = JSON.parse(reader.result);

          let xKey = xJsonKeyInput.value.trim();
          let yKey = yJsonKeyInput.value.trim();

          scatter.axes.xAxis.name = xKey;
          scatter.axes.yAxis.name = yKey;

          let xArray = [];
          let yArray = [];
          let skippedCount = 0;

          scatter.data.forEach(obj => {
            if (obj[xKey] && obj[yKey]) {
              xArray.push(obj[xKey]);
              yArray.push(obj[yKey]);
            } else {
              skippedCount += 1;
              console.log("Skipped " + skippedCount + " objects that don't have both x and y keys");
            }
          });

          scatter.data = create_data(xArray, yArray);
          settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
          // document.body.removeChild(document.getElementById("svgContainer"));
          // svg = createSvg(scatter);
          // plot = createScatterPlot(svg, scatter);
          // createAxis(svg, scatter, plot);
          // createGridLines(svg, scatter);
          // checkRegressionLine(svg, scatter, plot);
          // plotPoints(svg, scatter, plot);
          if (scatter.regressionLine.exist) {
            svg.selectAll(".regressionLine").remove();
          }
          if (scatter.gridLines.exist) {
            svg.selectAll(".x-axis").remove();
            svg.selectAll(".y-axis").remove();
            svg.selectAll(".grid-line").remove();
            createAxis(svg, scatter, plot);
          }
          updatePlot(svg, scatter, plot);
          createGridLines(svg, scatter);
          checkRegressionLine(svg, scatter, plot);
        };
        if (input.files.length === 0) return alert('Choose a file!');
        reader.readAsText(input.files[0]);
      });

      const importSettingsButton = document.createElement("input");
      importSettingsButton.setAttribute("id", "importSettings");
      importSettingsButton.setAttribute("type", "file");
      importSettingsButton.setAttribute("accept", ".scatterplotsettings");
      const importSettingsLabel = document.createElement("label");
      importSettingsLabel.innerHTML = "Import settings:" + "\t";
      document.body.appendChild(importSettingsLabel);
      importSettingsLabel.appendChild(importSettingsButton);
      importSettingsLabel.appendChild(document.createElement("br"));
      importSettingsButton.addEventListener("change", (e) => {
        const input = importSettingsButton;
        const reader = new FileReader();
        reader.onload = function () {
          scatter = JSON.parse(reader.result);

          if (isNaN(+scatter.data[0].x) || isNaN(+scatter.data[0].y)) {
            let xArray = [];
            let yArray = [];

            scatter.data.forEach(obj => {
              xArray.push(obj.x);
              yArray.push(obj.y);
            });

            scatter.data = create_data(xArray, yArray);
          }

          settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
          // document.body.removeChild(document.getElementById("svgContainer"));
          // svg = createSvg(scatter);
          // plot = createScatterPlot(svg, scatter);
          // createAxis(svg, scatter, plot);
          // createGridLines(svg, scatter);
          // checkRegressionLine(svg, scatter, plot);
          // plotPoints(svg, scatter, plot);
          if (scatter.regressionLine.exist) {
            svg.selectAll(".regressionLine").remove();
          }
          if (scatter.gridLines.exist) {
            svg.selectAll(".x-axis").remove();
            svg.selectAll(".y-axis").remove();
            svg.selectAll(".grid-line").remove();
            createAxis(svg, scatter, plot);
          }
          updatePlot(svg, scatter, plot);
          createGridLines(svg, scatter);
          checkRegressionLine(svg, scatter, plot);
        };
        reader.readAsText(input.files[0]);
      });

      const settingsForm = document.createElement("form");
      settingsForm.setAttribute("id", "settingsForm");
      const settingsLabel = document.createElement("label");
      settingsLabel.innerHTML = "Plot settings" + "\t";
      const settingsButton = document.createElement("input");
      settingsButton.setAttribute("type", "submit");
      settingsButton.setAttribute("value", "Submit settings");
      // const settingsArea = document.createElement("textarea");
      // settingsArea.setAttribute("id", "settingsArea");
      // settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
      // settingsArea.setAttribute("style", "width:250px;height:250px;");
      document.body.appendChild(settingsForm);
      settingsForm.appendChild(settingsLabel);
      settingsForm.appendChild(settingsButton);
      settingsLabel.appendChild(document.createElement("br"));
      settingsLabel.appendChild(settingsArea);

      settingsForm.addEventListener("submit", (e) => {
        e.preventDefault();
        scatter = JSON.parse(settingsArea.value);

        if (isNaN(+scatter.data[0].x) || isNaN(+scatter.data[0].y)) {
          let xArray = [];
          let yArray = [];

          scatter.data.forEach(obj => {
            xArray.push(obj.x);
            yArray.push(obj.y);
          });

          scatter.data = create_data(xArray, yArray);
        }

        // document.body.removeChild(document.getElementById("svgContainer"));
        // svg = createSvg(scatter);
        // plot = createScatterPlot(svg, scatter);
        // createAxis(svg, scatter, plot);
        // createGridLines(svg, scatter);
        // checkRegressionLine(svg, scatter, plot);
        // plotPoints(svg, scatter, plot);
        if (scatter.regressionLine.exist) {
          svg.selectAll(".regressionLine").remove();
        }
        if (scatter.gridLines.exist) {
          svg.selectAll(".x-axis").remove();
          svg.selectAll(".y-axis").remove();
          svg.selectAll(".grid-line").remove();
          createAxis(svg, scatter, plot);
        }
        updatePlot(svg, scatter, plot);
        createGridLines(svg, scatter);
        checkRegressionLine(svg, scatter, plot);
      });

      const dataForm = document.createElement("form");
      dataForm.setAttribute("id", "dataForm");
      const xDataLabel = document.createElement("label");
      xDataLabel.innerHTML = "x-values" + "\t";
      const xDataInput = document.createElement("input");
      xDataInput.setAttribute("id", "xDataInput");
      xDataInput.setAttribute("type", "text");
      xDataInput.setAttribute("value", "1,50,100");
      const yDataLabel = document.createElement("label");
      yDataLabel.innerHTML = "y-values" + "\t";
      const yDataInput = document.createElement("input");
      yDataInput.setAttribute("id", "yDataInput");
      yDataInput.setAttribute("type", "text");
      yDataInput.setAttribute("value", "1,50,100");
      const dataButton = document.createElement("input");
      dataButton.setAttribute("type", "submit");
      dataButton.setAttribute("value", "Submit data");
      document.body.appendChild(dataForm);
      dataForm.appendChild(xDataLabel);
      xDataLabel.appendChild(xDataInput);
      dataForm.appendChild(yDataLabel);
      yDataLabel.appendChild(yDataInput);
      dataForm.appendChild(dataButton);

      dataForm.addEventListener("submit", (e) => {
        e.preventDefault();
        scatter.data = create_data(xDataInput.value.replace(/\s/g, '').split(','), yDataInput.value.replace(/\s/g, '').split(','));
        settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
        // document.body.removeChild(document.getElementById("svgContainer"));
        // svg = createSvg(scatter);
        // plot = createScatterPlot(svg, scatter);
        // createAxis(svg, scatter, plot);
        // createGridLines(svg, scatter);
        // checkRegressionLine(svg, scatter, plot);
        // plotPoints(svg, scatter, plot);
        if (scatter.regressionLine.exist) {
          svg.selectAll(".regressionLine").remove();
        }
        if (scatter.gridLines.exist) {
          svg.selectAll(".x-axis").remove();
          svg.selectAll(".y-axis").remove();
          svg.selectAll(".grid-line").remove();
          createAxis(svg, scatter, plot);
        }
        updatePlot(svg, scatter, plot);
        createGridLines(svg, scatter);
        checkRegressionLine(svg, scatter, plot);
      });


      const regressButton = document.createElement("button");
      regressButton.innerHTML = "Regression Line";
      document.body.appendChild(regressButton);
      regressButton.addEventListener("click", (e) => {
        if (scatter.regressionLine.exist) {
          scatter.regressionLine.exist = false;
          svg.select(".regressionLine").remove();
        } else {
          scatter.regressionLine.exist = true;
        }
        checkRegressionLine(svg, scatter, plot);
        settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
      });

      let xAxisBool = scatter.axes.xAxis.exist;
      let yAxisBool = scatter.axes.yAxis.exist;
      const gridButton = document.createElement("button");
      gridButton.innerHTML = "Grid Lines";
      document.body.appendChild(gridButton);
      gridButton.addEventListener("click", (e) => {
        if (scatter.gridLines.exist) {
          scatter.gridLines.exist = false;
          scatter.axes.xAxis.exist = xAxisBool;
          scatter.axes.yAxis.exist = yAxisBool;
          if (!xAxisBool) svg.select(".x-axis").remove();
          if (!yAxisBool) svg.select(".y-axis").remove();
        } else {
          scatter.gridLines.exist = true;
          scatter.axes.xAxis.exist = true;
          scatter.axes.yAxis.exist = true;
        }
        createAxis(svg, scatter, plot);
        createGridLines(svg, scatter);
        if (!scatter.gridLines.exist) {
          svg.selectAll(".grid-line").remove();
        }
        settingsArea.innerHTML = JSON.stringify(scatter, null, 2);
      });

      document.body.appendChild(document.createElement("br"));

      const exportSettings = document.createElement("a");
      exportSettings.setAttribute("id", "exportSettings");
      exportSettings.innerHTML = "Export Settings";
      document.body.appendChild(exportSettings);
      exportSettings.addEventListener("click", (e) => {
        const settingsCopy = scatter;
        const file = new Blob([JSON.stringify(settingsCopy)], { type: 'text/plain' })
        exportSettings.href = URL.createObjectURL(file);
        exportSettings.download = 'scatterPlotSettings.scatterplotsettings';
      });

      document.body.appendChild(document.createElement("br"));

      const exportSVG = document.createElement("a");
      exportSVG.setAttribute("id", "exportSVG");
      exportSVG.innerHTML = "Export SVG";
      document.body.appendChild(exportSVG);
      exportSVG.addEventListener("click", (e) => {
        const file = new Blob([document.getElementById("svgContainer").innerHTML], { type: 'text/html' });
        exportSVG.href = URL.createObjectURL(file);
        exportSVG.download = 'scatterPlotSVG.html';
      });


   
    });
  </script>
</body>`);