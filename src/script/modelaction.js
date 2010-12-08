require.define({
  'modelaction' : function(require, exports, module){
    var nodes = require('nodes').nodes
      , relations = require('relations').relations
      , options = require('options').options
      , bus = require('eventbus').bus
      , generateGuid = require('guid').generateGuid
      
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
      , createnode : function(where){
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
        bus.publish('nodecreated', props)
      },
      moveNode : function(ev){
        nodes.get(ev.key, function(n){
          n.x = ev.x
          n.y = ev.y
          nodes.save(n)
        })
        bus.publish('nodemoved', ev)
      }, 
      resizeNode : function(ev){
        nodes.get(ev.id, function(n){
          n.scaleX = ev.scaleX
          n.scaleY = ev.scaleY
          nodes.save(n)
        })
      }
      
    }
    
      
    
    bus.subscribe('nodedropped', function(ev){
      modelAction.moveNode(ev) 
    })
    
    bus.subscribe('noderesized', function(ev){
      modelAction.resizeNode(ev) 
    })
    
    bus.subscribe('workspaceclicked', function(where){
      modelAction.createnode(where)
    })
    
    exports.modelAction = modelAction
  }
}, ['options', 'eventbus', 'guid'])
