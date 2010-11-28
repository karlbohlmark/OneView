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
      }
    }
    
    bus.subscribe('workspaceclicked', function(where){
      modelAction.createnode(where)
    })
    
    exports.modelAction = modelAction
  }
}, ['options', 'eventbus', 'guid'])
