require.define({'app':function(require, exports, module){

console.log('running app constructor')

var svg = require('svg').svg,
    getRectangleConnectionPoints = require('svg').getRectangleConnectionPoints,
    svgassets = require('svg-assets').svgassets,
    controlPanel = require('controlpanel'),
    bus = require('eventbus').bus


var inputstate = {
  mousedown: false,
  ctrlpressed: false
}

var nodes = require('nodes').nodes;
var relations = require('relations').relations;

var getRelationId = function(fromNode, toNode){
  return 'from=' + fromNode + '&to=' + toNode;
}

var app = (function(){
  var svgElem = svg.createElement('svg')
    , handlers = {}
  
  svgElem.appendChild(svg.defs)
  
  var actions = require('actions').actions;
  var trigger = require('trigger').trigger;
  
  trigger.registerHandlers(actions);
 
  return {
    run: function(parentElem){
      var thisApp = this
      console.log('running app.run')

      require('actions').setSvgElem(svgElem)
      require('uiaction').setSvgElem(svgElem)
      
      var panel = require('controls/panel').panel
      var controlPanelView = panel()
      controlPanelView.id = "control-panel"

      
      controlPanel.commands.forEach(function(item){
        controlPanelView.addItem({title:item, action: function(){
           bus.publish('command/clear')  
        }})  
      })
      
      
      parentElem.appendChild(controlPanelView.getDomElement())
      parentElem.appendChild(svgElem)
      
      nodes.each(function(node){
        if(typeof node.push === "function" && node.length>0) node = node[0]
        bus.publish('nodecreated', node)
      })
      
      relations.each(function(relation){
        if(typeof relation.push === "function" && relation.length>0) relation = relation[0]
        bus.publish('relationcreated', relation)
      })
      
      bus.subscribe('action/relationcreated', function(relation){
        bus.publish('relationcreated', relation)
      })
      
      svgElem.addEventListener('mousedown', function(ev){
        if(ev.which!=1) return
        if(ev.target.toString().match(/SVGSVGElement/)!==null)
        {
          bus.publish('workspaceclicked', {x:ev.pageX, y: ev.pageY})
        }else{
          bus.publish('elementclicked', ev)
        }
      })
      
      bus.publish('init-complete')
      bus.publish('hack/hideinput')
      
    }
  };
})();

exports.app = app;

}}, ['svg', 'controlpanel', 'actions', 'nodes', 'trigger', 
    'relations', 'controls/panel', 'keybindings', 'undo', 'uiaction']);
