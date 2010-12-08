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
    
    var getNodeRelations = function(id){
      var nodeRelations = []
      relations.each(function(r){
        if(r.from == id || r.to == id){
          nodeRelations.push(r)
        }
      })
      return nodeRelations
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
        
        handle11.addEventListener('mousedown', function(ev){
          bus.publish('resize', g)
          ev.stopPropagation()
        })
        
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
        //g.appendChild(handle00)
        //g.appendChild(handle01)
        //g.appendChild(handle10)
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
          titleInput.setAttribute('data-target', g.id)
          
          if(text.childNodes.length>0){
            titleInput.value = text.childNodes[0].textContent
          }else{
            titleInput.value=""
          }
          
          var pos = getNodePosition(this.parentNode)
          titleInput.style.left = (parseInt(pos.x) -77) +'px'
          titleInput.style.top = (parseInt(pos.y) + svgElem.offsetTop -18) +'px'
          titleInput.style.display = 'block'
          titleInput.focus()
          
          bus.publish('nodeeditmodeentered')
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
        
        box.setAttribute('width', width)
        box.setAttribute('height', height)
      }
    }
    
    bus.subscribe('resize', function(node){
      var rect = node.firstChild
        , origWidth = rect.getAttribute('width')
        , origHeight = rect.getAttribute('height')
        , pos = getNodePosition(node)
        , transform = node.getAttribute('transform')
        , relations = getNodeRelations(node.id)
        , width
        , height
      document.onmousemove = function(ev){
         var x = ev.clientX
           , y = ev.clientY
         width = (x-pos.x)*2
         height = (y-pos.y)*2
         scaleX = width/ origWidth
         scaleY = height/ origHeight
         
         node.setAttribute('transform', transform + " scale(" + scaleX + " " + scaleY  +")")
         for(var r in relations){
            r = relations[r]
            var path = document.getElementById(r.key)
            if(path==null)
              throw "no path matching: " + r.key
            path.parentNode.removeChild(path)
            
            bus.publish('relationcreated', r)
          }
      }
      document.onmouseup = function(){
        bus.publish('noderesized', {id: node.id, scaleX:scaleX, scaleY:scaleY})
        document.onmousemove = null
      }
    })
    
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
