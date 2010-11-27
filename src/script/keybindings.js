require.define({'keybindings': function(require, exports, module){
  var keyboard = require('keyboard').keyboard
    , bus = require('eventbus').bus
  
  var keyMeanings = {
    'Z' : 'undo',
    'esc' : 'cancel',
    'D': 'delete',
    'left': 'left',
    'right': 'right',
    'up': 'up',
    'down': 'down'
  }
  
  var specialKeyCodes = {
    'esc': 27,
    'left': 37,
    'up': 38,
    'right' : 39,
    'down' : 40
  }
  
  var keyMappings = {}
  
  for(var item in keyMeanings){
    if(item.length==1)
      keyMappings[item.charCodeAt(0)] =item 
    else if(item in specialKeyCodes)
      keyMappings[specialKeyCodes[item]]=item  
    else
      console && console.warn && console.warn('Cannot determine keycode for key:' + item) 
  }
  
  
  keyboard.keyup('keybindings', function(ev){
    bus.publish(keyMeanings[keyMappings[ev.which]])
  })
  
}}, ['keyboard', 'eventbus'])
