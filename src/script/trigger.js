require.define({'trigger': function(require, exports, module){
  var handlers = {}
  trigger = function(ev, data){
    var callbacks = handlers[ev]
    data.eventName = ev
    if(callbacks){
      for(var i in callbacks){
        if(callbacks.hasOwnProperty(i))
          callbacks[i].call(this, data)
      }
    }
  }
  trigger.registerHandlers = function(actions){
    for(var action in actions){
      if(!handlers[action])
        handlers[action] = []
        
      handlers[action].push(actions[action])
    }
  }
  
  exports.trigger = trigger
}})

