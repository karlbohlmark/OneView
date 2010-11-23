require.define({
  'keyboard': function(require, exports, module){
    var bus = require('eventbus').bus
      , keyupHandlers = []
      , removalEventMapping = {}
    
    var keyup = function(name, handler, until){
      keyupHandlers.push(handler)
      until && (removalEventMapping[until] || (removalEventMapping[until]=[])).push(handler)
    }
    
    document.onkeyup = function(ev){
      for(var i= keyupHandlers.length;i--;){
        keyupHandlers[i](ev)
      }
    }
    
    exports.keyboard = {
      keyup: keyup
    }
  }
}, ['eventbus'])
