require.define({
  'controls/style-editor': function(require, exports, module){
    var bus = require('eventbus').bus
      , options = require('options').options
      , html = require('html').dsl
    
    var dl = html.dl
      , dt = html.dt
      , dd = html.dd
      , div = html.div
      , input = html.input
    
    var opts = []
    for(var opt in options){
      opts.push( dt( opt ) )
      opts.push( dd( input({value:options[opt], name:opt, onkeydown:"require('controls/style-editor').eventHandler(this.name, this.value, arguments[0])"}) ) )
    }
    
    var deflist = dl.apply(null, opts)
    
    
    var domElement =div(deflist).toElement()
    domElement.id = 'styleEditor'
      
    bus.subscribe('cmd/style-editor/on', function(){
      domElement.style.display="block"
    })
    bus.subscribe('cmd/style-editor/off', function(){
      domElement.style.display="none"
    })
    
    var nodeList = document.querySelectorAll('#styleEditor dd')
    exports.eventHandler = function(name, value, e){
      if(e.which!=13)
        return
      
      options[name] = value
      
      if(name=='relationColor'){
        var marker = document.getElementById('arrowHead')
        marker.setAttributeNS(null, 'stroke', value)
        marker.setAttributeNS(null, 'fill', value)
      }
    }
    exports.styleEditor = domElement  
  }
   
}, ['eventbus', 'options', 'html'])
