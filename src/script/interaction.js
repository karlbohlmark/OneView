require.define({
  'interaction': function(require, exports, module){
      
      var edits = require('edits').edits
        , facet = require('facet').facet
        , bus = require('eventbus').bus
        , nodes = require('nodes').nodes
        , relations = require('relations').relations
        , generateGuid = require('guid').generateGuid
        , state = require('state').state
        , showMenu = require('controls/nodemenu').showMenu
        , titleInput = require('controls/titleinput').input
        , uiAction = require('uiaction').uiAction
        , modelAction = require('modelaction').modelAction
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
      
      var moveElement = function(x, y, element, nodeRelations){
        element.setAttributeNS(null, "transform", 'translate(' + x +' ' + y +')')
        for(var r in nodeRelations){
          r = nodeRelations[r]
          var path = document.getElementById(r.key)
          if(path==null)
            throw "no path matching: " + r.key
          path.parentNode.removeChild(path)
          
          bus.publish('relationcreated', r)
        }
      }
        

      document.body.appendChild(titleInput)
         
        
      bus.subscribe('hack/hideinput', function(){
        titleInput && (titleInput.style.display = "none")
      })
            
      var getRelationId = function(fromNode, toNode){
        return 'from=' + fromNode + '&to=' + toNode;
      }
      
      var actions = {
        drag : (function(){
          var canceller = function(ev){
            return function(){
                ev.cancelled = true
            }
          }
          return function(ev){
            var thisApp = this
              , cancel = canceller(ev)
            
            titleInput.style.display='none'  
            svgElem.addEventListener('mouseup', cancel)
            
            setTimeout(function(){
              svgElem.removeEventListener('mouseup', cancel)
            
              
              if(ev.cancelled){
                //Todo: fix this hack
                console.log(titleInput.style.display)
                return titleInput.style.display=='none' && bus.publish('elementselected', ev.target)
              }
              
              var element = ev.target
                , g = element.parentNode
                , id = g.id
                , nodeRelations = getNodeRelations(id)
                , pos = getNodePosition(g)
                , oldx =  pos.x
                , oldy = pos.y
              ;
              
              
              var dragElement = (function(element, nodeRelations){
                return function(ev){
                  moveElement(ev.x, ev.y, g, nodeRelations)
                }
              })(element, nodeRelations)
              
              document.onmousemove = dragElement
              
              document.onmouseup = function(ev){
                var pos = getNodePosition(element.parentNode)
                
                bus.publish('nodedropped', {key: element.parentNode.id, x: pos.x, y: pos.y, oldx:oldx, oldy:oldy})
                
                document.onmousemove = null
                document.onmouseup = null
              }
            }, 120)
          }
        })(),
      'select' : function(target){
        var selected = state.selected
        if(selected){
          var to = target.parentNode
            , key = getRelationId(selected.id, to.id)
            , relation = {
                key: key
              , from : selected.id
              , to: to.id
            }
          if(relation.to==relation.from) return state.selected = null
          
          relations.save(relation)
          
          bus.publish('relationcreated', relation)
          
          edits.unshift({eventName:'relationcreated', from: relation.from, to:relation.to, key: key})
          
          state.selected = null
          bus.publish('nodeunselected', selected)
          
        }else{
          var rect = target
          state.selected = rect.parentNode
          bus.publish('nodeselected', rect.parentNode)
        }
      }
    };


    bus.subscribe('elementclicked', function(ev){
      actions.drag(ev)
    })

    bus.subscribe('elementselected', function(target){
      actions.select(target)
    })
          
    bus.subscribe('titlegiven', function(ev){
      var target = ev.target
        , value = ev.value
        , node = document.getElementById(target)
        , text =node.childNodes[1]
        , oldText = text.textContent
      text.textContent =  value
      nodes.get(ev.target, function(n){
        n.text = value
        nodes.save(n)
      })
      
      edits.unshift({'eventName' : 'changetext', 'oldText':oldText, 'newText':value})
    })
    
    bus.subscribe('command/deleterelation', function(id){
      modelAction.deleteRelation(id)
      uiAction.deleteRelation(id)  
      edits.unshift({eventName:'relationdeleted', id:id})
    })
    
    bus.subscribe('cancel', function(){
      var selected = state.selected
      if(selected) {
        bus.publish('nodeunselected', selected)
      }
      state.selected = null
    })
        
    bus.subscribe('delete', function(){
      var id = state.selected && state.selected.id
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
      //Ok, it might be strange with the edit being appended async while the other action is sync...
      modelAction.removeNode(id)
      uiAction.removeNode(id)
      
      state.selected = null
    })
    
    //Todo: this really should be fixed. The movement should probably occur on the model before the ui is updated
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
      if(posTransforms.hasOwnProperty(transform)){
        bus.subscribe(transform, function(transform){ 
            return function(){
              move(transform)
            }
          }(transform)
        )
      }
    }
    
    //Todo: move or remove/fix this (the initialization should not cause edits to be stacked, or alternatively it should be the correct original events)
    bus.subscribe('init-complete', function(){
      edits.length = 0 /* Currently, the initialization process adds items to the edits array -> clear it */  
    })
    
    bus.subscribe('command/clear', function(){
      nodes.nuke() && relations.nuke()
      document.location.reload()
    })

    bus.subscribe('rootSVGElementCreated', function(elem){
      svgElem = elem    
    })
  
    
    exports.actions = actions  
  }
  

  
}, ['edits', 'facet', 'guid', 'eventbus', 'nodes', 
  'relations', 'state', 'keyboard', 'controls/nodemenu', 
  'controls/titleinput', 'uiaction', 'modelaction'])

  