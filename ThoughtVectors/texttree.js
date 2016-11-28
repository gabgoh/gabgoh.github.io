globali = 0;
diagramwidth = 760

function updater(svg, source, height, width) {

  var d3tree = d3.layout.tree().size([height, width]);
  var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

  // Compute the new tree layout.
  var nodes = d3tree.nodes(source)
  var links = d3tree.links(nodes)

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.y; d.x = d.x });

  // Declare the nodes…
  var node = svg.selectAll("g.node")
    .data(nodes, function (d) { return d.id || (d.id = ++globali) });

  node.exit().remove()

  // Add circles if there aren't enough
  var nodeEnter = node.enter().append("g").attr("class", "node")
  nodeEnter.append("circle")
    .attr("r", function(d) { 
      if (d.depth == 0) { return 4; }
      return 2; })
    .style("stroke", "black")
    .style("fill","white")

  nodeEnter.append("text")
    .attr("dy", function(d) 
      { return d.children || d._children ? "-0.4em" : "0.3em"; })
    .attr("dx", function(d)
      { return d.children || d._children ? "0em" : "0.5em"; })    
    .attr("text-anchor", function(d) 
      { return d.children || d._children ? "middle" : "start"; })
    .text(function(d) { return d.name; })
    .style("font-size", "11px")
    .attr("fill", "white")
    .transition().duration(150)
    .attr("fill", "black")

  node.attr("transform", function(d) 
    { return "translate(" + d.y + "," + d.x + ")"; })

  // Declare the links…
  var link = svg.selectAll("path.link")
    .data(links, function(d) { return d.target.id; });

  link.attr("d", diagonal);

  // Enter the links.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .style("stroke", "white")
    .transition().duration(150)
    .style("stroke", function(d) { return "black"; })
    .style("stroke-width", function(d) { return 2.5*Math.exp(d.target.logp) + 0.7 })
    .attr("d", diagonal)
    .style("fill","none")

  link.exit().remove()

}

function genTree(id, initdata) {

  divwidth = 720
  divheight = 180
  var margin = {top: 20, right: 80, bottom: 10, left: 10},
  	width = divwidth - margin.right - margin.left,
  	height = divheight - margin.top - margin.bottom;
  
  function create(divid) {

    var svg = d3.select("#"+divid).append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var div = document.getElementById(divid)
    div.style.cssText = "display:block; margin-left:auto; margin-right:auto; width:"+ (divwidth+20) + "px; height:" + divheight + "px; position:relative"

    return svg


  }

  var svg_elem = create(id);
  updater(svg_elem, initdata, height, width)

  function updater_gen(treesvg) {
    return function(data) {
      updater(treesvg, data, height, width)
    }
  
  }

  return updater_gen(svg_elem)

}

function genBreakdownWord(divname, wordData, wordList) {

  var wordDataList = wordData[0]
  var weights      = wordData[1]

  var outerdiv = document.getElementById(divname)
  outerdiv.style.cssText = "display: block; margin-left: auto; margin-right: auto; width: 720px; height: 224px; position: relative;"

  var treeDiv = document.createElement("div")
  treeDiv.id = divname+"treesvg"

  var border = document.createElement("div")
  border.style.cssText = "height:225px;"
  border.className = "border"
  outerdiv.appendChild(border)

  outerdiv.appendChild(treeDiv)

  var update = genTree(divname+"treesvg", wordDataList[wordDataList.length - 1])
  treeDiv.style.transform = "translateY(40px)"

  var refreshdata = function() {
    var total = 0;
    for (var i = 0; i < checks.length; i++) {
      if (checks[i].checked){
        total = total +  Math.pow(2,i)
      }
    }
    update(wordDataList[total])
  }

  function textCheckbox(textin, width, w, yval){

    var textdiv = document.createElement("div");
    textdiv.style.cssText = "cursor:pointer; position:absolute; margin:auto; width: " + width + "px; height:20px; top: 25px; left:" + yval +"px"

    var text = document.createElement("text");
    text.textContent = textin;
    text.style.cssText = "text-align:left; padding-left:22px; display:block; margin-left:auto; margin-right:auto;"    
    text.className = "wordmorphbutton"
    text.onclick = function() {
      check = this.parentElement.children[1].children[0]; 
      check.checked = !check.checked;
      refreshdata()
    }

    textdiv.appendChild(text);

    var checklabel = document.createElement("label");
    checklabel.className = "check"

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "myCheckbox";
    checkbox.id = divname + "_" + textin;
    checkbox.checked = true;
    checklabel.appendChild(checkbox);

    var checkdiv = document.createElement("div"); 
    checkdiv.className = "box"
    checkdiv.style.cssText = "position:absolute; top:-18px; left:4px"
    checklabel.appendChild(checkdiv)

    textdiv.appendChild(checklabel)

    var text = document.createElement("text");
    text.textContent = Math.abs(Math.round(w*1000)/1000);
    text.style.cssText = "position:absolute; padding-left:5px; top:-17px; text-align:left; font-size:10px;"
    textdiv.appendChild(text);

    return [textdiv, checkbox]

  }

  var checks = [];
  var cumsum = 0;
  var plustext = null;
  for (var i = 0; i < wordList.length; i ++){
    var text1 = textCheckbox(wordList[i][0], wordList[i][1], weights[wordList.length-i-1], cumsum)
    if (wordList[i][1] != 0){
      outerdiv.appendChild(text1[0])
      cumsum = cumsum + wordList[i][1] + 20

      // Add "+"
      plustext = document.createElement("text")
      plustext.textContent = "+"
      plustext.style.cssText = "position: absolute; top:25px; left:" + (cumsum-14) + "px; font-size:14px"    
      outerdiv.appendChild(plustext);

    }
    checks.push(text1[1])

  }

  plustext.textContent = "="

  for (var i = 0; i < 4; i++) { checks[i].onclick = refreshdata }

}

function genMorphWord(divname, atoms, vectorname,initdata) {

  var outerdiv = document.getElementById(divname)
  outerdiv.style.cssText = "display: block; margin-left: auto; margin-right: auto; width: 720px; height: 228px; position: relative;"

  var treeDiv = document.createElement("div")
  treeDiv.id = divname+"treesvg"

  var border = document.createElement("div")
  border.style.cssText = "height:225px;"
  border.className = "border"
  outerdiv.appendChild(border)

  outerdiv.appendChild(treeDiv)

  var update = genTree(divname+"treesvg", initdata)
  treeDiv.style.transform = "translateY(40px)"

  function getI() {
    for (var i = 0; i < 4; i++) {
      if (checks[i].checked) { return i }
    }
  }

  var range = document.createElement("input");
  range.setAttribute("type", "range");
  k = 10
  range.min = 0;
  range.max = 8;
  range.defaultVal = 8;
  range.style.cssText = "position:absolute; left:500px; top:35px; width: 200px; height: 0px"
  range.length = 10;
  range.className = "singlegradrange"
  range.oninput = function() {
    //let p = parseInt(this.value)/range.max
    //textdivfill.style.width = (p*200) + "px";
    //console.log(parseInt(this.value))
    update(initdata[getI()][range.value])    
  }

  var text = document.createElement("text");
  text.textContent = "0"
  text.style.cssText = "position:absolute; text-anchor:left; left:490px; top:30px; font-size:10px; text-style:bold"    
  outerdiv.appendChild(text);

  var text = document.createElement("text");
  text.textContent = "10"
  text.style.cssText = "position:absolute; text-anchor:left; left:705px; top:30px; font-size:10px; text-style:bold"    
  outerdiv.appendChild(text);

  outerdiv.appendChild(range)

  var refreshdata = function() {
    update(initdata[getI()][range.value])
  }

  function disable_all_checks(){
    for (var i = 0; i < checks.length; i++) {
      if (checks[i].checked){
        checks[i].checked = false;
      }
    } 
  }

  function textCheckbox(textin, yval, width){

    var textdiv = document.createElement("div");
    textdiv.style.cssText = "cursor: pointer; position:absolute; margin:auto; width: "+ width + "px; height:20px; top: 20px; left:" + yval +"px"

    var text = document.createElement("text");
    text.textContent = textin;
    text.style.cssText = "text-align:left; padding-left:22px; display:block; margin-left:auto; margin-right:auto; font-size:12px; text-style:bold; border:1px dashed gray; border-radius:4px;   box-shadow: 1.5px 1.5px 0px rgba(0, 0, 0, 0.1), 0px 0px 1.5px rgba(13, 13, 13, 0.39);"    
    text.onclick = function() {
      disable_all_checks()
      check = this.parentElement.children[1].children[0]; 
      check.checked = !check.checked;
      refreshdata()
    }

    textdiv.appendChild(text);

    var checklabel = document.createElement("label");
    checklabel.className = "check"

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "myCheckbox";
    checkbox.id = divname + "_" + textin;
    checkbox.checked = false;
    checklabel.appendChild(checkbox);

    var checkdiv = document.createElement("div"); 
    checkdiv.className = "box"
    checkdiv.style.cssText = "position:absolute; top:-18px; left:4px; border-radius:10px"
    checklabel.appendChild(checkdiv)

    textdiv.appendChild(checklabel)

    return [textdiv, checkbox]
  }

  var text1 = textCheckbox(atoms[0], 0, 130)
  text1[1].checked = true
  outerdiv.appendChild(text1[0])

  var text2 = textCheckbox(atoms[1], 150, 60)
  outerdiv.appendChild(text2[0])

  var text3 = textCheckbox(atoms[2], 230, 50)
  outerdiv.appendChild(text3[0])

  var text4 = textCheckbox(atoms[3], 300, 60)
  outerdiv.appendChild(text4[0])

  // var textdivfill = document.createElement("div");
  // textdivfill.style.cssText = "background:lightgreen; width:100px; cursor: pointer; position:absolute; margin:auto; height:20px; top: 30px; left: 500px"
  // outerdiv.appendChild(textdivfill);

  var textdiv = document.createElement("div");
  textdiv.style.cssText = "cursor: pointer; position:absolute; margin:auto; width: 200px; height:20px; top: 15px; left: 500px"
  var text = document.createElement("text");
  text.textContent = vectorname;
  //text.style.cssText = "text-align:left; padding-left:5px; display:block; margin-left:auto; margin-right:auto; font-size:12px; text-style:bold; border:1px solid gray; border-radius:4px; "    
  text.style.cssText = "text-align:left; padding-left:5px; display:block; margin-left:auto; margin-right:auto; font-size:12px; text-style:bold"    
  textdiv.appendChild(text);
  outerdiv.appendChild(textdiv);

  var checks = [text1[1], text2[1], text3[1], text4[1]]
  var R = Array.apply(null, {length: checks.length}).map(Number.call, Number)
  
  for (var i = 0; i < checks.length; i++) {
    f = function(i) { return function() {
      disable_all_checks();
      checks[i].checked = true;
      refreshdata()
    }}(i)
    checks[i].onclick = f
  }

  update(initdata[getI()][range.value])

}

function draw_gen(imageObj) {

  return function(inputcanvas, ind) {
    var context = inputcanvas.getContext('2d');

    var j = ind
    var width = 200

    var sourceX = j*width;
    var sourceY = 0;
    var sourceWidth = width;
    var sourceHeight = width;

    var destWidth = 95;
    var destHeight = 95;
    var destX = inputcanvas.width / 2 - destWidth / 2;
    var destY = inputcanvas.height / 2 - destHeight / 2;
    context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
  }

};

function genGallery(divname, imsheet, itemlist) {

  if (itemlist === undefined) {
    var itemlist = [0,1,2,3,4,5,6]
  }

  var outerdiv = document.getElementById(divname)
  outerdiv.style.cssText = "display:block; margin-left: auto; margin-right: auto; width:720px; height:140px; position:relative;"

  var border = document.createElement("div")
  border.style.cssText = "height:inherit;"
  border.className = "border"
  outerdiv.appendChild(border)

  var canvases = []
  for (var i = 0; i < 7; i ++) {
    var canvas = document.createElement("canvas")
    canvas.width = 95;
    canvas.height = 95;
    canvas.style.cssText = "background:black; border-top:1px solid black; border-left:1px solid black; border-right:1px solid black; border-bottom:1px solid black; position:absolute; border-radius:2px; left: " + (-2 + 104*i) + "px; top:20px; solid black"
    outerdiv.appendChild(canvas);
    canvases.push(canvas)
  }

  var imageObj = new Image();
  imageObj.src = imsheet;
  
  var draw = draw_gen(imageObj)

  imageObj.onload = function () {
    for (var i = 0; i < 7; i++){
      draw(canvases[i], itemlist[i])
    }
  }

}

genBreakdownWord("wordbreakdown1", Woman_Cat, [["Dog",55], ["Holding a cat",105], ["Girl/Woman and Cake",155], ["Woman at Counter",145]])
genBreakdownWord("wordbreakdown_cat", Woman_Cat, [["Dog",55], ["Holding a cat",105], ["Girl/Woman and Cake",155], ["Woman at Counter",145]])
genBreakdownWord("wordbreakdown_bw", Black_White, [[" ",0], ["Black and White Photo of",180], [" ",0], ["People with Umbrellas",160]])
genBreakdownWord("wordbreakdown_legomen", LEGOMen, [["Keyboard",100], ["Cutting Board",0], ["Runway",0], ["Skateboarder",100]])
genBreakdownWord("wordbreakdown_knife", Man_Knife, [["Scissors",75], ["Keyboard",0], ["Snowboard",0], ["Tie",55]])

genGallery("gallery_holding", "dex1262.jpg")
genGallery("gallery_dog", "dex1719.jpg")
genGallery("gallery_cake", "dex942.jpg", [0,2,4,5,6,7,9])
genGallery("gallery_woman", "dex638.jpg")
genGallery("black_white_woman", "dex1521.jpg")
genGallery("umbrella_woman", "dex411.jpg")
genGallery("gallery_tie", "dex506.jpg")
genGallery("gallery_scissors", "dex1644.jpg")

genGallery("gallery_many", "dex1168.jpg",[1,2,3,4,5,6,7])
genGallery("gallery_count", "dex1266.jpg",[0,1,2,3,4,6,7,8])
genGallery("gallery_statue", "dex1548.jpg",[0,1,2,4,5,6,7])

//genGallery("gallery_cutting", "dex1186.jpg",[0,2,4,5,6,7,9])
// genGallery("gallery_runway", "dex834.jpg")
genGallery("gallery_skate", "dex390.jpg")
genGallery("gallery_keyboard", "dex1626.jpg")

genMorphWord("wordmorpherstatue",["riding/snowboard","plane","cat","horse"], "Statue Vector",statue)
genMorphWord("wordmorphermany", ["riding/snowboard","plane","cat","horse"],"Many Vector", many)
genMorphWord("wordmorphercount", ["riding/snowboard","plane","cat","horse"],"Count Vector", count)
