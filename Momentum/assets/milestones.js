function renderMilestones(divname, updateTick) {
  var lambda = [1,10,100]
  var totalIters = 150

  var f = function(x) { 
    var fx = 0.5*(lambda[0]*x[0]*x[0] + lambda[1]*x[1]*x[1] + lambda[2]*x[2]*x[2])
    var g  = [lambda[0]*x[0], lambda[1]*x[1], lambda[2]*x[2]]
    return [fx, g]
  }

  function getTrace(alpha, beta) {
    var w0 = [1,1/Math.sqrt(lambda[1]),1/Math.sqrt(lambda[2])]
    var v = runMomentum(f, w0, alpha, beta, totalIters)
    var fxstack = []
    // Add contributions to the objective
    for (var i = 0; i < v[0].length; i++) {
        var x = v[1][i]
        fxstack.push([lambda[0]*x[0]*x[0]/2, lambda[1]*x[1]*x[1]/2, lambda[2]*x[2]*x[2]/2 ])
    }
    v.push(fxstack)
    return v
  }

  var v = getTrace(1.5/(lambda[2]), 0)


  var update = renderStackedGraph(divname, [0,1.6], v[2])

  var updateStep = function(alpha, beta) {
    var v2 = getTrace(alpha/(lambda[2]), beta)
    update(v2[2]) 
    // Update the milestones on the slider
    var milestones = [0,0,0]
    for (var i = 0; i < v2[1].length; i++) {
      if (v2[1][i][0] > 0.06) {  milestones[2] = i }
      if (v2[1][i][1] > 0.06) {  milestones[1] = i }
      if (v2[1][i][2] > 0.06) {  milestones[0] = i }
    }
    updateTick(milestones) 
  }
  return updateStep
}

function renderSliderAlpha(divname, updateStep) {

  var m = d3.scaleLinear().domain([0,100]).range([0,2])

  // var sliderAlphaDiv = document.createElement("div")
  // sliderAlphaDiv.style.display = "inline"

  // var sliderSteplength = document.createElement("INPUT")
  // sliderSteplength.setAttribute("type", "range");
  // sliderSteplength.style.marginLeft = "12px"
  // sliderSteplength.style.display = "relative"
  // sliderSteplength.style.top = "2px"

  // var text = document.createElement("text")
  // text.textContent = "$ \\alpha $"
  // text.style.marginLeft = "42px"

  // sliderAlphaDiv.appendChild(text)
  // sliderAlphaDiv.appendChild(sliderSteplength)

  // sliderSteplength.oninput = function() { updateStep(m(this.value),0) }

  // document.getElementById(divname).appendChild(sliderAlphaDiv)

}
