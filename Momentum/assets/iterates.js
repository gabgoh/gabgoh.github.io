//
// Plot Iterates
// Takes in : f, the objective functin
//            Name of div where the graphic is rendered
//            update, which gets passed in the objective 
//            values at every iteration
//
// Returns : callback `changeParams` to change alpha, beta
//

function genIterDiagram(f, xstar, axis) {

  var w = 900
  var h = 300
  var totalIters = 150
  var state_beta = 0.0
  var state_alpha = 0.001
  var num_contours = 15
  var onDrag = function() {}
  var w0 =[-1.21, 0.853]
  //var w0 = [0,0]

  function renderIterates(div) {

    // Render the other stuff
    var intDiv = div.style("width", w + "px")
      .style("height", h + "px")
      .style("box-shadow","0px 3px 10px rgba(0, 0, 0, 0.4)")
      .style("border", "solid black 1px")

    // Render Contours 
    var plotCon = contour_plot.ContourPlot(w,h)
        .f(function(x,y) { return f([x,y])[0] })
        .drawAxis(false)
        .xDomain(axis[0])
        .yDomain(axis[1])
        .contourCount(num_contours)
        .minima([{x:xstar[0], y:xstar[1]}]);

    var elements = plotCon(intDiv);

    var X = d3.scaleLinear().domain([0,1]).range(axis[0])
    var Y = d3.scaleLinear().domain([0,1]).range(axis[1])

    var cX = d3.scaleLinear().domain([0,1]).range([0, w])
    var cY = d3.scaleLinear().domain([0,1]).range([0, h])

    var svg = intDiv.append("div")
      .append("svg")
        .style("position", 'absolute')
        .style("left", 0)
        .style("top", 0)
        .style("width", w)
        .style("height", h)
        .style("z-index", 2) // d3 dot select
        
    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    var circ = svg.append("circle")
      .attr("cx", cX(X.invert(w0[0])) )
      .attr("cy", cY(Y.invert(w0[1])) )
      .attr("r", 4)
      .style("cursor", "pointer")
      .attr("fill", colorbrewer.OrRd[3][1])
      .attr("opacity", 0.8)
      .attr("stroke-width", 1)
      .attr("stroke", colorbrewer.OrRd[3][2])
      .call(d3.drag().on("drag", function() {
        var pt = d3.mouse(this)
        var x = X(cX.invert(pt[0]))
        var y = Y(cY.invert(pt[1]))
        this.setAttribute("cx", pt[0])
        this.setAttribute("cy", pt[1])
        w0 = [x,y]
        onDrag(w0)
        iter(state_alpha, state_beta, w0);
      }))
      
    // Append start at x^star
    svg.append("path")
      .attr("transform", "translate(" + cX(X.invert(xstar[0])) + "," + cY(Y.invert(xstar[1])) + ")")
      .attr("d", "M 0.000 2.000 L 2.939 4.045 L 1.902 0.618 L 4.755 -1.545 L 1.176 -1.618 L 0.000 -5.000 L -1.176 -1.618 L -4.755 -1.545 L -1.902 0.618 L -2.939 4.045 L 0.000 2.000")
      .style("fill", "white")
      .style("stroke-width",1)

    var svgpath = svg.append("path")
      .attr("opacity", 1)
      .style("stroke-width","1")
      .style("stroke-linecap","round")

    var valueline = d3.line()
      .x(function(d) { return cX(X.invert(d[0])); })
      .y(function(d) { return cY(Y.invert(d[1])); });

    var iterColor = d3.scaleLinear().domain([0, totalIters]).range(["black", "black"])

    var svgcircle = svg.append("g")

    function iter(alpha, beta, w0) {

      state_alpha = alpha
      state_beta = beta

      var OW = runMomentum(f, w0, alpha, beta, totalIters)
      var W = OW[1]
      var svgdata = svgcircle.selectAll("circle").data(W)

      circ.attr("cx",  cX(X.invert(w0[0])) ).attr("cy", cY(Y.invert(w0[1])) )

      svgdata.enter().append("circle")
        .attr("cx", function (d) { return cX(X.invert(d[0])) })
        .attr("cy", function (d) { return cY(Y.invert(d[1])) })
        .attr("r", 1.2 )
        .style("box-shadow","0px 3px 10px rgba(0, 0, 0, 0.4)")
        .attr("opacity", 1)
        .attr("fill", function(d,i) { return iterColor(i)})

      svgdata.merge(svgdata)
        .attr("cx", function (d) { return cX(X.invert(d[0])) })
        .attr("cy", function (d) { return cY(Y.invert(d[1])) })
        .attr("r", 1.2 )      
        .attr("opacity", 1)
        .attr("fill", function(d,i) { return iterColor(i)})
      svgdata.exit().remove()

      svgpath.attr("d", valueline(W))

      circ.moveToFront()
    }

    iter(state_alpha, state_beta, w0);
    
    return { control:iter, 
             w0:function() { return w0 }, 
             alpha:function() { return state_alpha }, 
             beta:function() {return state_beta} }

  }

  renderIterates.width = function (_) {
    w = _; return renderIterates;
  }

  renderIterates.height = function (_) {
    h = _; return renderIterates;
  }

  renderIterates.iters = function (_) {
    totalIters = _; return renderIterates;
  }

  renderIterates.drag = function (_) {
    onDrag = _; return renderIterates;
  }

  renderIterates.init = function (_) {
    w0 = _; return renderIterates;
  }

  renderIterates.alpha = function (_) {
    state_alpha = _; return renderIterates;
  }

  renderIterates.beta = function (_) {
    state_beta = _; return renderIterates;
  }

  return renderIterates

}
