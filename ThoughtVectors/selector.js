diagramwidth = 750

var linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "checkbox_style.css"; //Replace here
document.head.appendChild(linkElement);

var linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = "sliderstyle.css"; //Replace here
document.head.appendChild(linkElement);

function draw_gen(n_cols,imageObj) {

  return function(inputcanvas, ind) {
    var context = inputcanvas.getContext('2d');

    var i = Math.floor(ind/n_cols)
    var j = ind%n_cols

    var sourceX = i*64;
    var sourceY = j*64;
    var sourceWidth = 64;
    var sourceHeight = 64;
    var destWidth = sourceWidth;
    var destHeight = sourceHeight;
    var destX = inputcanvas.width / 2 - destWidth / 2;
    var destY = inputcanvas.height / 2 - destHeight / 2;
    context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);

  }

};

function createSelector(divname, imsheet, weights) {

  var borderleft = 10;
  var bordertop = 28
  var currdiv = document.getElementById(divname);
  currdiv.className = "image_selector"
  currdiv.style.cssText = "display:block; margin-left:auto; margin-right:auto; height:137px; position:relative;";

  var border = document.createElement("div");
  border.style.cssText = "height:137px"
  border.className = "border"
  currdiv.appendChild(border);

  var canvas = document.createElement("canvas");
  canvas.id = divname+"combined";
  canvas.width = 64;
  canvas.height = 64;
  canvas.style.cssText = "background:black; border-top:3px solid black; border-left:1px solid black; border-right:1px solid black; border-bottom:3px solid black; position:absolute; border-radius:2px; left: " + (borderleft + 620) + "px; top:" + (bordertop + 5) + "px; solid black"
  currdiv.appendChild(canvas);

  var context = canvas.getContext('2d');
  var imageObj = new Image();
  imageObj.src = imsheet;

  i = 15; j= 15

  var draw = draw_gen(16, imageObj)

  function onclick_gen(div_name){
    return function() {
      var v = 0;
      for (i = 0; i < 8; i ++) {
        if (document.getElementById(div_name+"checkbox"+i).checked){
          v = v + Math.pow(2,i)
        }
      }
      draw(canvas, v + 16)
    }
  } 

  var onclick = onclick_gen(divname)

  for (var i = 0; i < 8; i++) {

    var container = document.createElement("div")
    container.id = divname+"atomc" + i
    container.style.cssText = "cursor: pointer; position: absolute; width:100; height:100; left: " + (borderleft + 76*(i)+5)+ "px; top:" + (bordertop + 5) + "px;"
    currdiv.appendChild(container);

    var checkboxlabel = document.createElement("label")
    checkboxlabel.className = "check"

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "myCheckbox"
    checkbox.id = divname+"checkbox" + i;
    checkbox.onchange = onclick
    // checkbox.style.cssText = "position: absolute; top: " + 70 +"px; left: 23px;"
    checkbox.checked = true;
    checkboxlabel.appendChild(checkbox);

    var divelem = document.createElement("div")
    divelem.className = "box"
    divelem.style.cssText = "position: absolute; top: " + 75 +"px; left: " +(borderleft + 13) + "px;"

    checkboxlabel.appendChild(divelem)

    container.appendChild(checkboxlabel)

    var vals = document.createElement("text")
    vals.textContent = Math.abs(Math.round(1000*weights[i])/1000)
    vals.style.cssText = "position:absolute; text-anchor:left; top: " + -18 +"px; left:2px; font-size:10px; text-style:bold"    
    container.appendChild(vals);

    if (i != 7){
      var equaltext = document.createElement("text")
      equaltext.textContent = "+"
      equaltext.style.cssText = "position: absolute; top: " + 25 +"px; left:67px; font-size:14px"    
      container.appendChild(equaltext);

    } else{
      var equaltext = document.createElement("text")
      equaltext.textContent = "="
      equaltext.style.cssText = "position: absolute; top: " + 25 +"px; left:70px; font-size:14px"    
      container.appendChild(equaltext);   
    }

    var atom = document.createElement("canvas");
    atom.id = divname+"atom" + i;
    atom.width = 64;
    atom.height = 64;
    atom.className = "thumbh"
    atom.onclick = function () { 
      check = this.parentElement.children[0].children[0]; check.checked = !check.checked;
      onclick()
    }
    container.appendChild(atom);

  }

  var b1 = document.createElement("div")
  b1.style.cssText = "border-radius:2px; background:white; border:1px solid black; cursor: pointer; position: absolute; width:7px; height:7px; left:" + (690 + borderleft) +"px; top:35px"
  b1.onmouseover = function () { draw(canvas, 8) }
  b1.onmouseout = function () { onclick() }  
  currdiv.appendChild(b1);

  var b1 = document.createElement("div")
  b1.style.cssText = "border-radius:2px; background:white; border:1px solid black; cursor: pointer; position: absolute; width:7px; height:7px; left:" + (690 + borderleft) + "px; top:45px"
  b1.onmouseover = function () { draw(canvas, 9) }
  b1.onmouseout = function () { onclick() }  
  currdiv.appendChild(b1);

  imageObj.onload = function () { 

    for (var i = 0; i < 8; i++){
      var atom = document.getElementById(divname+"atom"+i)
      draw(atom,7-i)
    }

    onclick()

  }


}

sliderval = 0

function createMorpherPanel(divname, imsheetList, reverse) {
  
  var n = imsheetList.length;

  var currdiv = document.getElementById(divname);
  currdiv.style.cssText = "display:block; margin-left:auto; margin-right:auto; height:" + (n*75 + 55) + "px; position:relative";

  var line = document.createElement("div");
  line.style.cssText = "height:"+ (n*75 + 55) + "px"
  line.className = "border"
  currdiv.appendChild(line);

  var updater = []

  for (var i in imsheetList) {
    arrow = document.createElement("text");
    arrow.textContent = "+"  
    arrow.style.cssText = "position:absolute; left:17px; top:" + (i*75 + 50) + "px; width: 10px; height: 0px; border-left: 0px solid; border-right: 1px solid; font-size:12px"
    currdiv.appendChild(arrow)
    updater.push(createMorpher(currdiv, imsheetList[i], i*75))
  }

  topborder = 75*n + 25
  
  // Create Slider at Bottom

  arrow = document.createElement("text");
  arrow.textContent = "-10"
  arrow.style.cssText = "position:absolute; left:12px; top:" + (topborder-6) + "px; width: 20px; height: 0px; border-left: 0px solid; border-right: 1px solid; font-size:10px"
  currdiv.appendChild(arrow)

  arrow = document.createElement("text");
  arrow.textContent = "10"  
  arrow.style.cssText = "position:absolute; left:98px; top:" + (topborder-6) + "px; width: 15px; height: 0px; border-left: 0px solid; border-right: 1px solid; font-size:10px"
  currdiv.appendChild(arrow)

  arrow = document.createElement("text");
  arrow.textContent = "0"  
  arrow.style.cssText = "position:absolute; left:60px; top:" + (topborder+8) + "px; width: 10px; height: 0px; border-left: 0px solid; border-right: 1px solid; font-size:10px"
  currdiv.appendChild(arrow)

  var range = document.createElement("input");
  range.setAttribute("type", "range");
  k = 10; range.min = 1; range.max = 17; range.length = 10; 
  range.style.cssText = "position:absolute; left:30px; top:" + topborder + "px; width: 65px; height: 0px"
  range.className = "tip"

  arrow = document.createElement("text");
  arrow.textContent = "|"  
  arrow.style.cssText = "position:absolute; left:62px; top:" + (topborder) + "px; width: 10px; height: 0px; border-left: 0px solid; border-right: 1px solid; font-size:7px"
  currdiv.appendChild(arrow)
  
  range.oninput = function() { 
    var val = parseInt(this.value)
    for (var i in imsheetList){
      reverse[i] ? updater[i](val): updater[i](18-val)
    }
  };

  currdiv.appendChild(range)

}

/*

Create a single morpher line

currdiv   - div to append the morpher to
divname   -
imsheet   - image
topborder - distance from the top

*/
function createMorpher(currdiv, imsheet, topborder) {

  var divname = "hi"
  var imageObj = new Image();
  imageObj.src = imsheet;
  var draw = draw_gen(18, imageObj)
  var leftborder = 90;

  var faces = []

  var face = document.createElement("canvas");
  face.id = divname+"combined"+i;
  face.width = 64;
  face.height = 64;
  face.style.cssText = "position:absolute; left: 30px; top:" + (25 + topborder) +"px;";
  face.className = "thumb"
  currdiv.appendChild(face);
  faces.push(face);

  for (var i = 0; i < 8; i ++) {

    var face = document.createElement("canvas");
    face.id = divname+"combined"+i;
    face.width = 64;
    face.height = 64;
    face.style.cssText = "position:absolute; left: " + (leftborder + (i%10)*70 + 35) +"px; top: " + (25 + topborder) + "px; "
    face.className = "thumb"
    currdiv.appendChild(face);
    faces.push(face)

  }

  var drawindex = function (inval) {
    for (var i = 0; i < 9; i++) {
      draw(faces[i], (i*18) + inval); 
    }
  }

  imageObj.onload = function() { drawindex(0) };
  return drawindex

}


function createGallery(divname, imsheet, cols, rows) {

  var spacing = function(i) {return (i == 0) ? 30 : (i*70 + 55)}
  var currdiv = document.getElementById(divname);
  currdiv.style.cssText = "display:block; margin-left:auto; margin-right:auto; height:" + (30 + rows*75) + "px; position:relative;";

  var border = document.createElement("div");
  border.style.cssText = "height:"+ (30 + rows*75) +"px"
  border.className = "border"
  currdiv.appendChild(border);

  var imageObj = new Image();
  imageObj.src = imsheet;
  var draw = draw_gen(cols, imageObj)
  var leftborder = 95;

  var canvases = []
  for (var j = 0; j < rows; j ++) {
    for (var i = 0; i < cols; i++){
      var canvas = document.createElement("canvas");
      canvas.id = divname+"combined";
      canvas.width = 64;
      canvas.height = 64;
      var left = spacing(i)
      canvas.style.cssText = "background:black; border-top:3px solid black; border-left:1px solid black; border-right:1px solid black; border-bottom:3px solid black; position:absolute; border-radius:2px; left: " + left +"px; top:" + (18 + j*75)+ "px; solid black"
      currdiv.appendChild(canvas);
      canvases.push(canvas);
    }
  }

  imageObj.onload = function() { 
    for (var j = 0; j < rows; j ++) {
      for (var i = 0; i < cols; i++) {
        draw(canvases[i+j*cols], i + j*cols) 
      }
    }
  };

}


function createSlidingGallery(divname, imsheet, weights) {

  var spacing = function(i) {return (i*72 + 65)}
  var rows = 2
  var cols = 8

  var topborder = -15
  var currdiv = document.getElementById(divname);
  currdiv.style.cssText = "display:block; margin-left:auto; margin-right:auto; height:" + (50 + rows*75) + "px; position:relative;";
  currdiv.className = "sliding_gallery"

  var border = document.createElement("div");
  border.style.cssText = "height:"+ (50 + rows*75) +"px"
  border.className = "border"
  currdiv.appendChild(border);

  var imageObj = new Image();
  imageObj.src = imsheet;
  var draw = draw_gen(2, imageObj)
  var leftborder = 95;

  var drawtop = function(canvas, ii) { draw(canvas, 2*ii) }
  var drawbtm = function(canvas, ii) { draw(canvas, 2*ii+1) }

  var mainthumb = document.createElement("canvas");
  mainthumb.id = divname+"combined";
  mainthumb.width = 64;
  mainthumb.height = 64;
  mainthumb.style.cssText = "background:black; border-top:3px solid black; border-left:1px solid black; border-right:1px solid black; border-bottom:3px solid black; position:absolute; border-radius:2px; left: " + 640 + "px; top:" + (80 + topborder) + "px; solid black"
  currdiv.appendChild(mainthumb);

  var canvases = []

  var currentk = 32;

  for (var j = 0; j < rows; j ++) {
    for (var i = 0; i < cols; i++){
      var canvas = document.createElement("canvas");
      canvas.id = divname+"combined";
      canvas.width = 64;
      canvas.height = 64;
      var left = j == 0 ? i*76 + 15 : (cols - i - 1)*76 + 15
      canvas.style.cssText = "background:black; border-top:3px solid black; border-left:1px solid black; border-right:1px solid black; border-bottom:3px solid black; position:absolute; border-radius:2px; left: " + left + "px; top:" + (40 + j*90 + topborder)+ "px; solid black; transition: all 0.2s"
      
      currdiv.appendChild(canvas);
      canvas.onmouseover = (function(i) { return function() { 
        currentk = i;
        for (var k = 0; k < 16; k++) {
          i < k ? canvases[k].style.opacity = 0.2: canvases[k].style.opacity = 1;
        }
        drawtop(mainthumb, i)
      } })(i + cols*j)
      canvases.push(canvas);

      var wtext = document.createElement("text")
      wtext.textContent = Math.round(1000*Math.abs(weights[i]))/1000
      wtext.style.cssText = "position: absolute; top: " + (25 + (j*90) + topborder)  +"px; left:" + (17+(i*76)) +"px; font-size:10px"    
      currdiv.appendChild(wtext);  

      if (i != 0) {
        var plustext = document.createElement("text")
        plustext.textContent = "+"
        plustext.style.cssText = "position: absolute; top: " + (64 + (j*90) + topborder)  +"px; left:" + (7+(i*76)) +"px; font-size:14px"    
        currdiv.appendChild(plustext);   
      }

    }
      
    var equaltext = document.createElement("text")
    equaltext.textContent = "="
    equaltext.style.cssText = "position: absolute; top: " + (108 + topborder) + "px; left:" + (622) +"px; font-size:14px"    
    currdiv.appendChild(equaltext);   
      
    var b1 = document.createElement("div")
    b1.style.cssText = "border-radius:2px; background:white; border:1px solid black; cursor: pointer; position: absolute; width:7px; height:7px; left:710px; top:" + (82 + topborder) + "px"
    b1.onmouseover = function () { draw(mainthumb, 32) }
    b1.onmouseout = function () { drawtop(mainthumb, currentk) }  
    currdiv.appendChild(b1);

    var b1 = document.createElement("div")
    b1.style.cssText = "border-radius:2px; background:white; border:1px solid black; cursor: pointer; position: absolute; width:7px; height:7px; left:710px; top:" + (92 + topborder) + "px"
    b1.onmouseover = function () { draw(mainthumb, 33) }
    b1.onmouseout = function () { drawtop(mainthumb, currentk) }  
    currdiv.appendChild(b1);

  }

  var drawstart = function() { 
    for (var i = 0; i < 2*cols; i++) {
      drawbtm(canvases[i], i) 
    }
    drawtop(mainthumb, 15)
  }

  imageObj.onload = drawstart
  
}

ng1  = [3.6289, -2.8809, 3.9297, 3.5234, -3.6875, -4.0195, -2.6738, -2.9316, -3.4629, 2.8574, 2.6699, 2.7344, 3.0957, -2.373, 2.3535, -3.3086]
yann = [3.6875, -2.3145, 3.1152, -2.6348, -2.6094, 2.25, 3.1191, -2.6719, -4.5273, -2.3379, 2.6582, 3.3516, 2.1738, 3.1582, -2.4688, 3.3105]

createSlidingGallery("ascent_1", "Final_morphyann.jpg", yann)
createSlidingGallery("ascent_2", "Final_morphng.jpg", ng1)

createGallery("gallery_gothic","gothic.jpg", 9, 1)
createGallery("gallery_light","frontlight.jpg", 9, 1)
createGallery("gallery_sunglass","sunglass.jpg", 9, 1)
//createGallery("gallery_atom","allatoms_10_n.jpg", 8, 3, function(i) {return (i*72 + 65)})

createSelector("breakdown1","out1129.jpg", [ 8.17540274,-3.79154397, -7.25203161, -6.70193808, 3.93183709, 4.72854296, 5.69133867, 4.72729968])
createSelector("breakdown2","out1129.jpg", [ 8.17540274,-3.79154397, -7.25203161, -6.70193808, 3.93183709, 4.72854296, 5.69133867, 4.72729968])
createSelector("breakdown3","out3261.jpg", [-5.37155852,  5.64222388,  3.07397276, -3.22001743,  3.04643365, -4.05068635 ,-3.3590393 , 3.79310622])
createSelector("breakdown4","out3028.jpg", [-4.8735154, 6.25165191, 5.64953727, 7.04688969, 5.37010529, -4.28709214, 3.74329972, 4.61900516])

createMorpherPanel("morph_angle",["Final_morph57.jpg","Final_morph977.jpg"], [true,true])
createMorpherPanel("morph_shape",["Final_morph164.jpg","Final_morph855.jpg","Final_morph1918.jpg"], [true,false,true])
createMorpherPanel("morph_light",["Final_morph382.jpg","Final_morph1480.jpg"], [true,false])
createMorpherPanel("morph_hair",["Final_morph78.jpg","Final_morph654.jpg","Final_morph1466.jpg"], [true,false,true])
createMorpherPanel("morph_expression",["Final_morph566.jpg","Final_morph1004.jpg"], [true,true])
createMorpherPanel("morph_acc",["Final_morph1279.jpg", "Final_morph35.jpg", "Final_morph545.jpg"], [false,false,true])

// (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
// (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
// m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
// })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// ga('create', 'UA-65931696-1', 'auto');
// ga('send', 'pageview');
