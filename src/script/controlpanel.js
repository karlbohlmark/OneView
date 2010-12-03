require.define({'controlpanel':function(require, exports){
  var bus = require('eventbus').bus
  
  var Command = function(commandname){
    this.name = commandname
  }
  
  var signal = function(commandname){
    var thiz = new Command(commandname)
    thiz.action = function(){
      bus.publish('cmd/' + commandname)
    }
    return thiz
  }
  
  var toggle = function(commandname, defaultOn){
    var thiz = new Command(commandname)
    var on = typeof defaultOn != "undefined" ? defaultOn : false 
    thiz.action = function(){
      var cmd = 'cmd/' + commandname + '/'
      if(on)
        cmd+='on'
      else
        cmd+='off'
      
      on=!on
      bus.publish(cmd)
    }
    return thiz
  }
  
  /*** Commands of type 'signal' will just send a cmd/{commanname} on the bus
   * while commands of type 'toggle' will send cmd/{commandname}/on and cmd/{commandname}/off
   */
  exports.commands = [
    signal('clear'), 
    toggle('style-editor')
  ]
  
}}, ['eventbus'])
