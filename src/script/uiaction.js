require.define({
  'uiaction': function(require, exports, module){
    var bus = require('eventbus').bus
      , svg = require('svg').svg
      , facet = require('facet').facet
      , titleInput = require('controls/titleinput').input
      , relations = require('relations').relations
      , nodes = require('nodes').nodes
      , getRectangleConnectionPoints = require('svg').getRectangleConnectionPoints
      , svgElem
      , options = require('options').options

    
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
          , rect = svg.createElement('rect', facet('rx', 'ry', 'width', 'height', 'fill', 'stroke')(nodeData))
          , handle = svg.createElement('rect', {width: nodeData.width+5, fill:'transparant', height: nodeData.height+5, 'stroke':'#000000', 'stroke-width': '1px'})
          , handle00 = svg.createElement('rect', {width: 8, fill:'black', height: 8, 'stroke':'#000000', 'stroke-width': '1px'})
          , text = svg.createElement('text', {'text-anchor': 'middle', 'dominant-baseline': 'ideographic', 'pointer-events':'none', 'font-size':'22'})
          , useCapture = false
        g.setAttributeNS(null, 'transform', 'translate(' + nodeData.x + ' ' + nodeData.y +')')
        
        var x = -nodeData.width/2
          , y = -nodeData.height/2
        rect.setAttributeNS(null, 'x', x)
        rect.setAttributeNS(null, 'y', y)
        
        handle.setAttributeNS(null, 'x', x-2)
        handle.setAttributeNS(null, 'y', y-2)
        handle.setAttribute('class', 'handle')
        
        handle00.setAttribute('x', x-2)
        handle00.setAttribute('y', y-2)
        handle00.setAttribute('class', 'handle')
        
        var handle01 = handle00.cloneNode()
        handle01.setAttribute('x', -x-4)
        handle01.setAttribute('y', y-2)
        
        var handle10 = handle00.cloneNode()
        handle10.setAttribute('x', x-2)
        handle10.setAttribute('y', -y-5)
        
        var handle11 = handle00.cloneNode()
        handle11.setAttribute('x', -x-4)
        handle11.setAttribute('y', -y-5)
        
        /*
        g.addEventListener('mouseover', function(){
          this.setAttribute('class', 'active')
        }, useCapture)
        g.addEventListener('mouseout', function(){
          this.removeAttribute('class')
        }, useCapture)
        */
        
        rect.addEventListener('mouseover', function(ev){
          this.setAttributeNS(null, "stroke-width", '7px')
        }, useCapture)
        rect.addEventListener('mouseout', function(ev){
          this.removeAttribute('stroke-width')
        }, useCapture)
        g.appendChild(rect)
        g.appendChild(text)
        g.appendChild(handle)
        g.appendChild(handle00)
        g.appendChild(handle01)
        g.appendChild(handle10)
        g.appendChild(handle11)
        
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
        
        rect.addEventListener('dblclick', function(e){
          console.log('doubleclick')
          titleInput.setAttribute('data-target', g.id)
          if(text.childNodes.length>0){
            titleInput.value = text.childNodes[0].textContent
          }else{titleInput.value=""}
          var pos = getNodePosition(this.parentNode)
          titleInput.style.left = (parseInt(pos.x) -77) +'px'
          titleInput.style.top = (parseInt(pos.y) + svgElem.offsetTop -18) +'px'
          titleInput.style.display = 'block'
          titleInput.focus()
          
          bus.publish('nodeeditmodeentered')
          //titleInput.removeAttribute('x-webkit-speech')
        }, useCapture)
      },
       relationCreated : function(relation){
        var points = getRectangleConnectionPoints(document.getElementById(relation.from), document.getElementById(relation.to))
        var id = getRelationId(relation.from, relation.to)
        points.push({id:id})
        svg.drawConnection.apply(svgElem, points)
      },
      /*mousemove eventhandler*/
      drawSelectionBox: function(ev){
        var box = document.getElementById('selection')
        var x = parseInt(box.getAttribute('x'))
        var y = parseInt(box.getAttribute('y'))
        var width = ev.clientX - x
        var height = ev.clientY - y
        
        nodes.all(function(n){
          for(var i=n.length;i--;){
            var node = n[i]
            var right = node.x + node.width/2
             ,  left = node.x - node.width/2
             ,  top = node.y - node.height/2
             ,  bottom = node.y + node.height/2
            
            if(right<x || left>(x+ width) || (top>y+height) || bottom<y){
              document.getElementById(node.key).removeAttribute('class')              
            }else{
              document.getElementById(node.key).setAttribute('class', 'active')
            }
          }
        })
        
        console.log(width)
        box.setAttribute('width', width)
        box.setAttribute('height', height)
      }
    }
    
    bus.subscribe('relationcreated', function(relation){
      uiAction.relationCreated(relation)
    })
    
    bus.subscribe('nodeunselected', function(n){
      n.firstChild.removeAttribute("data-selected")
    })

    bus.subscribe('nodeselected', function(n){
      var rect =n.childNodes[0]
      rect.setAttributeNS(null, "data-selected", 'true')
    })
    
    bus.subscribe('nodecreated', function(node){
      uiAction.createNode(node)
    })

    bus.subscribe('rootSVGElementCreated', function(elem){
      svgElem = elem    
    })

    exports.uiAction = uiAction
  }
}, ['eventbus', 'svg', 'controls/titleinput', 'relations', 'options', 'nodes'])
