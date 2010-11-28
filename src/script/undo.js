require.define({
  'undo': function(require,exports, module){
     var bus = require('eventbus').bus
       , edits = require('edits').edits
       , nodes = require('nodes').nodes
       , relations = require('relations').relations
       , uiAction = require('uiaction').uiAction
       , modelAction = require('modelaction').modelAction
       , actions = require('actions').actions
     
    var getNodeRelations = function(id){
      var nodeRelations = []
      relations.each(function(r){
        if(r.from == id || r.to == id){
          nodeRelations.push(r)
        }
      })
      return nodeRelations
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
    
    bus.subscribe('nodecreated', function(n){
      n.eventName = 'nodecreated'
      edits.unshift(n)
    })
  
    exports.undos = undos
  }
}, ['eventbus', 'nodes', 'relations', 'actions', 'edits', 'uiaction', 'modelaction'])
