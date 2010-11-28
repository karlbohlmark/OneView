require.define({
  'uiaction': function(require, exports, module){
    var bus = require('eventbus').bus
      , svg = require('svg').svg
      , facet = require('facet').facet
      , titleInput = require('controls/titleinput').input
      , relations = require('relations').relations
      , getRectangleConnectionPoints = require('svg').getRectangleConnectionPoints
      , svgElem

    
    var getNodePosition = function(n){
      var matrix = n.transform.animVal.getItem(0).matrix
      return {x:matrix.e, y:matrix.f}
    }
    
    var getRelationId = function(fromNode, toNode){
      return 'from=' + fromNode + '&to=' + toNode;
    }
    
    var uiAction = {
      removeNode: function(id){
        var element = document.getElementById(id)
        element.parentNode.removeChild(element)
      },
      deleteRelation: function(id){
        var el = document.getElementById(id)
        el.parentNode.removeChild(el)
      },
      createNode : function(nodeData){
        var g = svg.createElement('g', {id: nodeData.id})
          , rect = svg.createElement('rect', facet('rx', 'ry', 'width', 'height', 'fill', 'stroke', 'stroke-width')(nodeData))
          , text = svg.createElement('text', {'text-anchor': 'middle', 'dominant-baseline': 'ideographic', 'font-size':'22', 'pointer-events': 'none'})
        g.setAttributeNS(null, 'transform', 'translate(' + nodeData.x + ' ' + nodeData.y +')')
        rect.setAttributeNS(null, 'x', -nodeData.width/2)
        rect.setAttributeNS(null, 'y', -nodeData.height/2)
        rect.addEventListener('mouseover', function(ev){
          //showMenu.call(this, rect)
        })
        g.appendChild(rect)
        g.appendChild(text)
        text.textContent = nodeData.text || ''
        svgElem.appendChild(g)
        var inp = titleInput
        inp.id="theinput"
        inp.setAttribute('data-target', g.id)
        var pos = getNodePosition(g)
        inp.value = ''
        inp.style.left = (parseInt(pos.x) -77) +'px'
        inp.style.top = (parseInt(pos.y) + svgElem.offsetTop -18) +'px'
        inp.style.display = 'block'
        inp.focus()
      },
       relationCreated : function(relation){
        var points = getRectangleConnectionPoints(document.getElementById(relation.from), document.getElementById(relation.to))
        var id = getRelationId(relation.from, relation.to)
        points.push({id:id})
        svg.drawConnection.apply(svgElem, points)
      }
    }
    
    bus.subscribe('relationcreated', function(relation){
      uiAction.relationCreated(relation)
    })
    
    bus.subscribe('nodecreated', function(node){
      uiAction.createNode(node)
    })
    
    exports.uiAction = uiAction
    exports.setSvgElem = function(s){svgElem = s}
  }
}, ['eventbus', 'svg', 'controls/titleinput', 'relations'])
