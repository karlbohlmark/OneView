require.define({'app':function(require, exports, module){

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
    , options = {
         nodeHeight : 120
       , nodeWidth  : 200
       , nodeColor  : '#202020'
       , nodeFill   : '#efefef'
      }
  ;
  
  require('actions').setOptions(options)
  
  bus.subscribe('command/deleterelation', function(id){
    relations.each(function(r){
      if(r.key==id){
        relations.remove(id)
        var el = document.getElementById(id)
        el.parentNode.removeChild(el)
      }
    })
  })
  
  var actions = require('actions').actions;
  var trigger = require('trigger').trigger;
  
  trigger.registerHandlers(actions);
 
  return {
    run: function(parentElem){
      var thisApp = this

      require('actions').setSvgElem(svgElem)    
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
        trigger.apply(thisApp, ['nodecreated', node])
      })
      
      relations.each(function(relation){
        if(typeof relation.push === "function" && relation.length>0) relation = relation[0]
        trigger.apply(thisApp, ['relationcreated', relation])
      })
      
      svgElem.addEventListener('mousedown', function(ev){
        if(ev.which!=1) return
        if(ev.target.toString().match(/SVGSVGElement/)!==null)
        {
          trigger.apply(thisApp, ['createnode', {x:ev.pageX, y: ev.pageY}])
        }else{
          trigger.apply(thisApp, ['drag', {target: ev.target}])
        }
      })
      
      bus.publish('init-complete')
      bus.publish('hack/hideinput')
      
      
      document.onkeydown = function(ev){
        if(ev.which=='z'.charCodeAt(0) || ev.which=='Z'.charCodeAt(0)){
          bus.publish('undo')
        }
      }
    }
  };
})();

exports.app = app;

}}, ['svg', 'controlpanel', 'actions', 'nodes', 'trigger', 'relations', 'controls/panel']);
