/*
  Render the whole momentum widget
*/
function renderMomentum(div) {

  var num_iters = 100

  function getTrace(alpha, beta, xy, coord) {
    var m = []
    var lambda = [1,100]
    var iter = geniterMomentum([[1, 0],[0, 1]], lambda, lambda, alpha, beta)
    // run for 500 iterations
    for (var i = 0; i <= num_iters; i++) { 
      if (xy == 1) {  m.push(numeric.add(iter(i)[xy],-1)) }
      if (xy == 0) {  m.push(numeric.mul(iter(i)[xy],0.005)) }
    }
    return numeric.transpose(m)[coord]
  }

  var outdiv = div.style("display", "block")
                 .style("margin-left","auto")
                 .style("margin-right","auto")
                 .style("position", "relative")
                 .style("width", "920px")
                 .style("height", "200px")
                 .style("border-radius", "5px")

  var outdiv = outdiv.append("div").style("position", "absolute").style("top", "0px")
  var updatePath = stemGraphGen(580, 150, num_iters).axis([-1.2, 1.2])(outdiv)

  render2DSliderGen(function(alpha, beta) {
    updatePath(getTrace(alpha, beta, 1,1) )
  })(div)

}

/*
  Render 2D slider thingy to the right.
*/
function render2DSliderGen(updatex) {

  var slider2Dtop  = 20     // Margin at top
  var slider2Dleft = 610    // How far to the left to put the 2D Slider
  var slider2D_size = 150;  // Dimensions (square) of 2D Slider

  function render2DSlider(divin){

    function getEigs(alpha, beta,lambda) {
      var E = [[ beta          , lambda          ], 
              [ -1*alpha*beta , 1 - alpha*lambda]]
      return numeric.eig(E)["lambda"]
    }

    var div = divin
      .append("div")
      .style("position","absolute")
      .attr("class", "d3-tip n")
      .style("z-index", 2)
      .html("s1 = <br> s2 = <br> complex")
      .style("opacity",0)

    var ybeta  = d3.scaleLinear().domain([1,0]).range([0, slider2D_size]);
    var xalpha = d3.scaleLinear().domain([0,4/100]).range([0, 2*slider2D_size]);

    var canvas = divin
      .append('canvas')
        .style("position", 'absolute')
        .style("left", slider2Dleft + "px")
        .style("top", slider2Dtop + "px")
        .style("width", 2*slider2D_size)
        .style("height", slider2D_size)
        .attr("width", 2*slider2D_size)
        .attr("height", slider2D_size)
        .style("z-index", 1)
        .style("border", "solid 1px black")
        .style("box-shadow","0px 3px 10px rgba(0, 0, 0, 0.4)")
        .on("mousemove", function() {
          var pt = d3.mouse(this)
          var alpha = xalpha.invert(pt[0])
          var beta  = ybeta.invert(pt[1])  	

          xAxis.select("circle").attr("cx", pt[0])      
          yAxis.select("circle").attr("cy", pt[1])
          
          var e = getEigs(alpha,beta, 100)
          var n1 = 0
          var n2 = 0
          var regime = ""
          var regime2 = "convergent"
          if (e.y === undefined) {
            n1 = Math.abs(e.x[0])
            n2 = Math.abs(e.x[1])
            regime = "real"
          } else {
            n1 = numeric.norm2(e.x[0], e.y[0])    
            n2 = numeric.norm2(e.x[1], e.y[1]) 
            regime = "complex,"               
          }

          if (Math.max(n1,n2) < 1) {
            updatex(alpha,beta);
          } else {
            regime2 = "divergent"
          }

          var divwidth = div.node().getBoundingClientRect().width;
          var divheight = div.node().getBoundingClientRect().height;        
          div.style("left", (pt[0] + slider2Dleft - divwidth/2) + "px")
          div.style("top", (pt[1] + slider2Dtop - divheight - 6) + "px")
          
          div.html("s1 =" + round(n1) + 
                   "<br>s2 =" + round(n2) + "<br> " + regime + " " + regime2)
          div.style("opacity",1)  
        })
        .on("mouseout", function() {
          div.style("opacity",0)
        })
        .node();

    renderHeatmap(canvas, function(i,j) { 
      var e = getEigs(4*i,1-j, 1)
      return Math.max(e.getRow(0).norm2(), e.getRow(1).norm2()); 
    }, d3.scaleLinear().domain([0,0.3,0.5,0.7,1]).range(colorbrewer.Spectral[5]))

    /* Axis */
    var canvasaxis = divin.append("svg").style("z-index", 0)
      .style("position","absolute")
      .style("left",slider2Dleft - 50)
      .style("top", 0)
      .style("width",2*slider2D_size + 70)
      .style("height",slider2D_size + 60)

    var xAxis = canvasaxis.append("g")
    xAxis.append("circle").attr("fill", "black").attr("r", 2)
    xAxis.attr("class", "grid")
      .attr("transform", "translate(51,"+(slider2D_size + 25) +")")  
      .call(d3.axisBottom(d3.scaleLinear().domain([0,4]).range([0, 2*slider2D_size]))
          .ticks(2)
          .tickSize(4))

    var yAxis = canvasaxis.append("g")
    yAxis.append("circle").style("fill", "black").attr("r", 2)
    yAxis.attr("class", "grid")
      .attr("transform", "translate(46,"+slider2Dtop+")")
      .call(d3.axisLeft(ybeta).ticks(1).tickSize(4))

    // svg alpha ...
    canvasaxis.append("g")
    .attr("transform", "translate(32,"+(slider2Dtop + slider2D_size/2 - 6) +")")
    .append("use")
    .attr("xlink:href", "#texbeta")

    // svg beta ...
    canvasaxis.append("g")
    .attr("transform", "translate(" + (45 + slider2D_size) + ","+(slider2Dtop + slider2D_size + 22) +")").text("$\alpha$")
    .append("use")
    .attr("xlink:href", "#texalpha")

  }

  render2DSlider.margin = function (_1, _2) {
    slider2Dtop = _1; slider2Dleft = _2; return render2DSlider
  }

  render2DSlider.size = function (_) {
    slider2D_size = _; return render2DSlider
  }

  return render2DSlider
}