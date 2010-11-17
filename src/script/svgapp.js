require.define({'svgapp':function(require, exports, module){

var svg = require('svg').svg,
    svgassets = require('svg-assets').svgassets

var inputstate = {
  mousedown: false,
  ctrlpressed: false
}

var nodes = new Lawnchair({table: 'nodes'});
var relations = new Lawnchair({table:'relations'});
var edits = [];//new Lawnchair({table:'edits'})

var getRelationId = function(fromNode, toNode){
  return 'from=' + fromNode + '&to=' + toNode;
}

var facet = function(/*varargs*/){
  var args = arguments
  return function(obj){
    var i=0, o = {}
    for(i=0; i<args.length; i++){
      o[args[i]] = obj[args[i]]
    }
    return o
  }
}

var app = (function(){
  var svgElem
    , handlers = {}
    , nodeHeight = 120
    , nodeWidth = 200
    , nodeColor = '#202020'
    , nodeFill = '#efefef'
    , generateGuid = function(){
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
         }).toUpperCase();
      }
    , trigger = function(ev, data){
        var callbacks = handlers[ev]
        data.eventName = ev
        if(callbacks){
          for(var i in callbacks){
            if(callbacks.hasOwnProperty(i))
              callbacks[i].call(this, data)
          }
        }
      }
    , moveElement = function(x, y, element, nodeRelations, app){
        element.setAttributeNS(null, "transform", 'translate(' + x +' ' + y +')')
        for(var r in nodeRelations){
          r = nodeRelations[r]
          var path = document.getElementById(r.key)
          path.parentNode.removeChild(path)
          trigger.apply(app, ['relationcreated', r])
        }
      }
    , getNodeRelations = function(id){
        var nodeRelations = []
        relations.each(function(r){
          if(r.from == id || r.to == id){
            nodeRelations.push(r)
          }
        })
        return nodeRelations
      }
  ;
  
  var input, getSpeechInput = function(){ 
    if(input) return input
    input = document.createElement('input')
    input.style.position = 'absolute'
    input.style.display = 'none'
    input.style.borderRadius = '7px'
    input.style.opacity = 1
    input.setAttribute('x-webkit-speech', '')
    input.style.width = '152px'
    input.style.fontSize = "20px"
    input.style.height = '30px'
    input.onkeyup = function(ev){
      if(ev.which==13){ 
        this.style.display = 'none'
        var target = this.getAttribute('data-target')
          , node = document.getElementById(target)
          , text =node.childNodes[1]
          , oldText = text.textContent
        text.textContent =  input.value
        nodes.get(target, function(n){
          n.text = input.value
          nodes.save(n)
        })
        edits.unshift({'eventName' : 'changetext', 'oldText':oldText, 'newText':input.value})
        input.value = ""
      }
    }
    document.body.appendChild(input)
    return input
  }
  
  var showMenu = (function(){
    var edit = svg.createElement('path', {'d':svgassets['edit-icon']})
      , g = svg.createElement('g')
    edit.setAttributeNS(null, 'style', 'display:none')
    edit.setAttributeNS(null, 'id', 'edit-icon')
    g.appendChild(edit)
    return function(nodeElement){
      if(document.getElementById('edit-icon')===null)
        nodeElement.parentNode.parentNode.appendChild(g)
    
      var matrix = nodeElement.parentNode.transform.animVal.getItem(0).matrix
      g.setAttributeNS(null, 'transform', 'translate(' + (parseInt(matrix.e) + 60) + ' ' + (parseInt(matrix.f) - 50) + ')')
      edit.setAttributeNS(null, 'style', 'display:block')
    }
  })()
  
  var actions = {
    'relationcreated': function(relation){
      var points = getRectangleConnectionPoints(document.getElementById(relation.from), document.getElementById(relation.to))
      var id = getRelationId(relation.from, relation.to)
      points.push({id:id})
      svg.drawConnection.apply(svgElem, points)
    },
    'nodemoved' : function(ev){
      nodes.get(ev.key, function(n){
        n.x = ev.x
        n.y = ev.y
        nodes.save(n)
      })
      edits.unshift(ev)
    },
    'nodecreated' : function(nodeData){
      edits.unshift(nodeData)
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
      text.textContent = nodeData.text
      svgElem.appendChild(g)
      var inp = getSpeechInput()
      inp.id="theinput"
      inp.setAttribute('data-target', g.id)
      var matrix = g.transform.animVal.getItem(0).matrix
      inp.value = ''
      inp.style.left = (parseInt(matrix.e) -70) +'px'
      inp.style.top = parseInt(matrix.f) -10 +'px'
      inp.style.display = 'block'
      inp.focus()
    },
    'createnode' : createnode = function(where){
      var x = where.x
        , y = where.y
        , height = nodeHeight
        , width = nodeWidth
        , color = nodeColor
      ;
      var props = {
        "x": x,
        "y": y ,
        "rx": 20,
        "ry": 20,
        "width": width,
        "height": height,
        "fill": nodeFill,
        "stroke": color,
        "stroke-width": '5',
        "id": generateGuid() 
      }      
      props.key = props.id
      nodes.save(props)
      trigger.apply(this, ['nodecreated', props])
    },
    'drag' : (function(){
      var canceller = function(ev){
        return function(){
            ev.cancelled = true
        }
      }
       
      return function(ev){
        var thisApp = this
          , cancel = canceller(ev)
          
        svgElem.addEventListener('mouseup', cancel)
        setTimeout(function(){
          svgElem.removeEventListener('mouseup', cancel)
          if(ev.cancelled){
            trigger.apply(thisApp, ['select', ev])
            return
          }
          
          var element = ev.target
            , g = element.parentNode
            , rect = g.childNodes[0]
            , id = g.getAttributeNS(null, 'id')
            , nodeRelations = getNodeRelations(id)
            , matrix = g.transform.animVal.getItem(0).matrix
            , oldx =  matrix.e
            , oldy = matrix.f
          ;
          
          
          var dragElement = (function(element, nodeRelations, app){
            return function(ev){
              moveElement(ev.x, ev.y, g, nodeRelations, app)
            }
          })(element, nodeRelations, thisApp)
          
          document.onmousemove = dragElement
          
          document.onmouseup = function(ev){
            var matrix = element.parentNode.transform.animVal.getItem(0).matrix
            trigger.apply(thisApp, ['nodemoved', {key: element.parentNode.id, x: matrix.e, y: matrix.f, oldx:oldx, oldy:oldy}])
            document.onmousemove = null
            document.onmouseup = null
          }
        }, 100)
      }
    })(),
    'select' : (function(){
      var selected = null
      return function(ev){
        var thisApp = this
         
        if(selected){
          var to = ev.target.parentNode
            , key = getRelationId(selected.id, to.id)
            , relation = {
                key: key
              , from : selected.id
              , to: to.id
            }
          ;
          relations.save(relation)
          trigger.apply(thisApp, ['relationcreated', relation])
          edits.unshift({eventName:'relationcreated', from: relation.from, to:relation.to, key: key})
          selected.firstChild.setAttributeNS(null, "stroke-width", '5px')
          selected = null
        }else{
          var rect = ev.target
          rect.setAttributeNS(null, "stroke-width", '7px')
          selected = ev.target.parentNode
        }
      }
    })()
  };
  
  for(var action in actions){
    if(!handlers[action])
      handlers[action] = []
      
    handlers[action].push(actions[action])
  }
  
  var undos = {
    'nodemoved' : function(edit){
      var element = document.getElementById(edit.key)
      var id = edit.key
        , nodeRelations = getNodeRelations(id)
        
      nodes.get(id, function(node){
        node.x = edit.oldx
        node.y = edit.oldy
        nodes.save(node)
      })
      
      moveElement(parseInt(edit.oldx), 
        parseInt(edit.oldy), 
        element, nodeRelations, this
      )
    }
    , 'nodecreated' : function(edit){
      var id = edit.id
        , element = document.getElementById(id)
       
      element.parentNode.removeChild(element)
      nodes.remove(id)
    }
    , 'relationcreated' : function(edit){
      var id = edit.key
        , element = document.getElementById(id)
      relations.remove(id)
      element.parentNode.removeChild(element)
    }
  }
 
  return {
    run: function(parentElem){
      var thisApp = this
      svgElem = svg.createElement('svg')
      parentElem.appendChild(svgElem)
      
      nodes.each(function(node){
        if(typeof node.push === "function" && node.length>0) node = node[0]
        trigger.apply(thisApp, ['nodecreated', node])
      })
      
      relations.each(function(relation){
        if(typeof relation.push === "function" && relation.length>0) relation = relation[0]
        trigger.apply(thisApp, ['relationcreated', relation])
      })
      
      svgElem.addEventListener('mousedown', function(ev){
        if(ev.which!=1) return
        if(ev.target.toString().match(/SVGSVGElement/)!==null)
        {
          trigger.apply(thisApp, ['createnode', {x:ev.pageX, y: ev.pageY}])
        }else{
          trigger.apply(thisApp, ['drag', {target: ev.target}])
        }
      })
      
      edits.length = 0 /* Currently, the initialization process adds items to the edits array -> clear it */
      
      input && (input.style.display = "none") //TODO: in order not to show the input after initialization
      document.onkeydown = function(ev){
        if(ev.which=='z'.charCodeAt(0) || ev.which=='Z'.charCodeAt(0)){
          var edit = edits.shift()
            , undoAction
          edit && (undoAction = undos[edit.eventName])
          undoAction && undoAction.call(this, edit)
          
          input.style.display = "none" //TODO: ok, this should really not be here
        }
      }
    }
  };
})();

exports.app = app;

}}, ['svg']);
