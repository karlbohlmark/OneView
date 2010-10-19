ns = {
  svg: 'http://www.w3.org/2000/svg'
};

var halfway = function(here, there){
  return {
    x: here.x + (there.x - here.x)/2,
    y: here.y + (there.y - here.y)/2
  }
}

var getRectangleConnectionPoints = function(fromElem, toElem){
  var fromAttr = fromElem.childNodes[0].attributes
    , toAttr = toElem.childNodes[0].attributes
    , fromMatrix = fromElem.transform.animVal.getItem(0).matrix
    , toMatrix = toElem.transform.animVal.getItem(0).matrix
    , fromx = parseInt(fromMatrix.e)
    , fromy = parseInt(fromMatrix.f)
    , tox = parseInt(toMatrix.e)
    , toy = parseInt(toMatrix.f)
    , fromWidth = parseInt(fromAttr.width.value)
    , fromHeight = parseInt(fromAttr.height.value)
    , toWidth = parseInt(toAttr.width.value)
    , toHeight = parseInt(toAttr.height.value)
    , xdiff = (fromx - tox)
    , ydiff = (fromy - toy)
    , fromPointx = xdiff < 0 ? fromx + fromWidth/2 : fromx - fromWidth/2
    , fromPointy = (ydiff < 0) ? fromy : fromy
    , toPointx = xdiff < 0 ? tox - toWidth/2 : tox + toWidth/2
    , toPointy = toy
  return [{x:fromPointx, y:fromPointy},{x:toPointx, y:toPointy}]
}
var svg = {
  createElement: function(elementType, attrs){
    var elem = document.createElementNS(ns.svg, elementType)
    if(elem && attrs){
      for(attr in attrs){
        elem.setAttributeNS(null, attr, attrs[attr])
      }
    }
    return elem
  },
  drawPoint: function(point){
    var circle = document.createElementNS(ns.svg, 'circle')
    circle.setAttributeNS(null, 'cx', point.x)
    circle.setAttributeNS(null, 'cy', point.y)
    circle.setAttributeNS(null, 'r', 3)
    circle.setAttributeNS(null, 'stroke', 'black')
    this.appendChild(circle)
  },
  drawConnection: function(point1, point2, options){
      var pathData = ["M"]
      , middle = halfway(point1, point2)
      pathData.push(point1.x)
      pathData.push(point1.y)
      pathData.push('q')
      pathData.push(middle.x - point1.x)
      pathData.push(point1.y - point1.y)
      pathData.push(middle.x - point1.x)
      pathData.push(middle.y - point1.y)
      pathData.push('q')
      pathData.push(middle.x - middle.x)
      pathData.push(point2.y - middle.y)
      pathData.push(point2.x - middle.x)
      pathData.push(point2.y - middle.y)
      var data = pathData.join(' ')
        , bezierPath = document.createElementNS(ns.svg, 'path')
      bezierPath.setAttributeNS(null, 'fill', 'none')
      bezierPath.setAttributeNS(null, 'stroke', '#000000')
      bezierPath.setAttributeNS(null, 'stroke-width', '5px')
      this.appendChild(bezierPath)
      bezierPath.setAttributeNS(null, 'd', data)
      if(options && options.id)
        bezierPath.setAttributeNS(null, 'id', options.id)
      
  }
};