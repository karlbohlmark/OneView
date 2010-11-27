require.define({
  'keyboard': function(require, exports, module){
    var bus = require('eventbus').bus
      , keyupHandlers = []
      , removalEventMapping = {}
    
    var keyup = function(name, handler, until){
      keyupHandlers.push(handler)
      until && (removalEventMapping[until] || (removalEventMapping[until]=[])).push(handler)
    }
    
    var modifiers = {
      ctrl: false,
      alt: false
    }
    
    document.onkeydown = function(ev){
      if(ev.which == 17)
        modifiers.ctrl = true
      if(ev.which == 18)
        modifiers.alt = true
    }
    
    document.onkeyup = function(ev){
      if(ev.which==17)
        modifiers.ctrl = false
      if(ev.which==18)
        modifiers.alt = false
      
      for(var i= keyupHandlers.length;i--;){
        keyupHandlers[i](ev)
      }
    }
    
    exports.keyboard = {
      keyup: keyup,
      modifiers: modifiers
    }
  }
}, ['eventbus', 'state'])
