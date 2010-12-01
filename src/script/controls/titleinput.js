require.define({
  'controls/titleinput' : function(require, exports, module){
    var bus = require('eventbus').bus
    
    var input = document.createElement('input')
    input.style.position = 'absolute'
    input.style.display = 'none'
    input.style.borderRadius = '7px'
    input.style.opacity = 1
    input.setAttribute('x-webkit-speech', '')
    input.style.width = '152px'
    input.style.fontSize = "20px"
    input.style.height = '30px'
    input.onkeyup = function(ev){
      if(this.style.display=='none') return
      
      if(ev.which==13){ 
        this.style.display = 'none'
        var target = this.getAttribute('data-target')
        
        bus.publish('titlegiven', {'target': target, value: input.value})
        
        input.value = ""
      }else if(ev.which==27){
        this.style.display = 'none'
        input.value = ""
      }
      ev.stopPropagation()
    }
    
    exports.input = input
  }
}, ['eventbus'])
