require.define({
  'ui' : function(require, exports, module){
      var svg = require('svg').svg
        , bus = require('eventbus').bus
        , controlPanel = require('controlpanel')
        , panel = require('controls/panel').panel
        , styleEditor = require('controls/style-editor').styleEditor
      
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
      
      /**
       * Control panel with high level menu options such as 'clear canvas'
       */
      var controlPanelView = panel()
      controlPanelView.id = "control-panel"
      
      controlPanel.commands.forEach(function(item){
        controlPanelView.addItem(item)
      })
      
      
      
      exports.init = function(parentEl){
        parentEl.appendChild(controlPanelView.getDomElement())
        parentEl.appendChild(svgElem)
        parentEl.appendChild(styleEditor)
      }
  }
}, ['svg', 'eventbus', 'controlpanel', 'controls/panel', 'controls/style-editor'])
