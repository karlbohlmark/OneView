require.define({
  'actions': function(require, exports, module){
      
      var getRectangleConnectionPoints = require('svg').getRectangleConnectionPoints
        , svg = require('svg').svg
        , edits = require('edits').edits
        , facet = require('facet').facet
        , bus = require('eventbus').bus
        , nodes = require('nodes').nodes
        , relations = require('relations').relations
        , generateGuid = require('guid').generateGuid
        , state = require('state').state
        , options
        , svgElem
        , keyboard = require('keyboard').keyboard
      
      var getNodeRelations = function(id){
        var nodeRelations = []
        relations.each(function(r){
          if(r.from == id || r.to == id){
            nodeRelations.push(r)
          }
        })
        return nodeRelations
      }
      
      var getNodePosition = function(n){
        var matrix = n.transform.animVal.getItem(0).matrix
        return {x:matrix.e, y:matrix.f}
      }
      
      var moveElement = function(x, y, element, nodeRelations, app){
        element.setAttributeNS(null, "transform", 'translate(' + x +' ' + y +')')
        for(var r in nodeRelations){
          r = nodeRelations[r]
          var path = document.getElementById(r.key)
          path.parentNode.removeChild(path)
          trigger.apply(app, ['relationcreated', r])
        }
      }
        
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
        
      bus.subscribe('hack/hideinput', function(){
        input && (input.style.display = "none")
      })
            
      var getRelationId = function(fromNode, toNode){
        return 'from=' + fromNode + '&to=' + toNode;
      }
      
      
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
        var inp = getSpeechInput()
        inp.id="theinput"
        inp.setAttribute('data-target', g.id)
        var pos = getNodePosition(g)
        inp.value = ''
        inp.style.left = (parseInt(pos.x) -77) +'px'
        inp.style.top = (parseInt(pos.y) + svgElem.offsetTop -18) +'px'
        inp.style.display = 'block'
        inp.focus()
      },
      'createnode' : createnode = function(where){
        var x = where.x
          , y = where.y
          , height = options.nodeHeight
          , width = options.nodeWidth
          , color = options.nodeColor
        ;
        var props = {
          "x": x,
          "y": y ,
          "rx": 20,
          "ry": 20,
          "width": width,
          "height": height,
          "fill": options.nodeFill,
          "stroke": color,
          "stroke-width": '5',
          "id": generateGuid() 
        }      
        props.key = props.id
        nodes.save(props)
        trigger.apply(this, ['nodecreated', props])
        edits.unshift(props)
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
          input.style.display='none'  
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
              var pos = getNodePosition(element.parentNode)
              trigger.apply(thisApp, ['nodemoved', {key: element.parentNode.id, x: pos.x, y: pos.y, oldx:oldx, oldy:oldy}])
              document.onmousemove = null
              document.onmouseup = null
            }
          }, 120)
        }
      })(),
      'select' : function(ev){
        var thisApp = this
          , selected = state.selected
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
          state.selected = null
        }else{
          var rect = ev.target
          rect.setAttributeNS(null, "stroke-width", '7px')
          state.selected = ev.target.parentNode
        }
      }
    };
    
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
        modelAction.removeNode(id)
        uiAction.removeNode(id)
      }
      , 'relationcreated' : function(edit){
        var id = edit.key
          , element = document.getElementById(id)
        relations.remove(id)
        element.parentNode.removeChild(element)
      }
      , 'relationdeleted' : function(edit){
        var id = edit.id
          , parts = id.split('&')
          , from = parts[0].split('=')[1]
          , to = parts[1].split('=')[1]
          , relation = {
            from :from,
            to: to,
            key: id
          }
          
          relations.save(relation)
          bus.publish('action/relationcreated', relation)
      }
      , 'deletenode' : function(edit){
        modelAction.createNode(edit)
        actions.nodecreated(edit)
      }
    }
    
    var modelAction = {
      removeNode : function(id){
        nodes.remove(id)
      }
      , createNode: function(n){
        nodes.save(n) 
      }
      , deleteRelation: function(id){
        relations.remove(id)
      }
    }
    
    var uiAction = {
      removeNode: function(id){
        var element = document.getElementById(id)
        element.parentNode.removeChild(element)
      },
      deleteRelation: function(id){
        var el = document.getElementById(id)
        el.parentNode.removeChild(el)
      }
    }
  
    bus.subscribe('undo', function(){
      console.log('undoing')
      var edit = edits.shift()
        , undoAction
      if(!edit) return
     
      console.log(edit)
      
      if(Array.isArray(edit)){
        var length=edit.length
        for(var i=0;i<length;i++)
        {
          undoAction = undos[edit[i].eventName]
          undoAction && undoAction.call(this, edit[i])
        }
      }else{
        undoAction = undos[edit.eventName]
        undoAction && undoAction.call(this, edit)
      }
      
      bus.publish('hack/hideinput')  
    })
    
    bus.subscribe('command/deleterelation', function(id){
      modelAction.deleteRelation(id)
      uiAction.deleteRelation(id)  
      edits.unshift({eventName:'relationdeleted', id:id})
    })
    
    bus.subscribe('cancel', function(){
      var selected = state.selected
      selected && selected.firstChild.setAttributeNS(null, "stroke-width", '5px')
      state.selected = null
    })
        
    bus.subscribe('delete', function(){
      var id = state.selected.id
      if(!id) return
      nodes.get(id, function(node){
        var rels = []
        relations.each(function(r){
          if(r.from==id || r.to==id){ 
            modelAction.deleteRelation(r.key)
            uiAction.deleteRelation(r.key)
            rels.push(r)
          }
        })
        
        
        node.eventName = 'deletenode'
        for(var i in rels){
          rels[i].eventName = 'relationdeleted'
          rels[i].id= rels[i].key
        }
        
        var log = [node]
        log = log.concat(rels)
        
        edits.unshift(log)  
      })
      //Ok, ite might be strange with the edit being appended async while the other action is sync...
      modelAction.removeNode(id)
      uiAction.removeNode(id)
      
      state.selected = null
    })
    
    var move = function(direction){
      if(!state.selected) return
      var id = state.selected.id
      var node = document.getElementById(id)
      var pos = getNodePosition(node)
      var relations = getNodeRelations(id)
      posTransforms[direction](pos)
      moveElement(pos.x, pos.y, node, relations, {});
    }
    
    var posTransforms ={
      'down' : function(pos){
        pos.y+= (keyboard.modifiers.ctrl ? 10: 1)
      },
      'up' : function(pos){
        pos.y-= (keyboard.modifiers.ctrl ? 10: 1)
      },
      'left' : function(pos){
        pos.x-= (keyboard.modifiers.ctrl ? 10: 1)
      },
      'right' : function(pos){
        pos.x+= (keyboard.modifiers.ctrl ? 10: 1)
      }
    }
    
    for(var transform in posTransforms){
      if(posTransforms.hasOwnProperty(transform))
        bus.subscribe(transform, function(transform){ return function(){move(transform)}}(transform))
    }
    
    bus.subscribe('init-complete', function(){
      edits.length = 0 /* Currently, the initialization process adds items to the edits array -> clear it */  
    })
    
    bus.subscribe('command/clear', function(){
      nodes.nuke() && relations.nuke()
      document.location.reload()
    })

  
    exports.setSvgElem = function(elem){
      svgElem = elem
    }
    exports.setOptions = function(o){options=o}
    exports.undos = undos
    exports.actions = actions  
  }
  

  
}, ['svg', 'edits', 'facet', 'guid', 'eventbus', 'nodes', 'relations', 'state', 'keyboard'])

  