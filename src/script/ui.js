require.define({
  'ui' : function(require, exports, module){
      var parent
        , svg = require('svg').svg
        , bus = require('eventbus').bus
        , controlPanel = require('controlpanel')
        , panel = require('controls/panel').panel
      var svgElem = svg.createElement('svg')
      svgElem.appendChild(svg.defs)
      
            
      svgElem.addEventListener('mousedown', function(ev){
        if(ev.which!=1) return
        if(ev.target.toString().match(/SVGSVGElement/)!==null)
        {
          bus.publish('workspaceclicked', {x:ev.pageX, y: ev.pageY})
        }else{
          bus.publish('elementclicked', ev)
        }
      })
      
      bus.subscribe('init-start', function(){
        bus.publish('rootSVGElementCreated', svgElem)  
      })
      
      var controlPanelView = panel()
      controlPanelView.id = "control-panel"

      
      controlPanel.commands.forEach(function(item){
        controlPanelView.addItem({title:item, action: function(){
           bus.publish('command/clear')  
        }})  
      })
      
      exports.setParent = function(parentEl){
        parent = parentEl
        parent.appendChild(controlPanelView.getDomElement())
        parent.appendChild(svgElem)
      }
  }
}, ['svg', 'eventbus', 'controlpanel', 'controls/panel'])
