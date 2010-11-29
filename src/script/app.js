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
  var handlers = {}
  
  bus.publish('init-start')
  
  var actions = require('actions').actions;
  var trigger = require('trigger').trigger;
  
  trigger.registerHandlers(actions);
 
  return {
    run: function(parentElem){
      var thisApp = this
      console.log('running app.run')
      
      require('ui').setParent(parentElem)
      
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

      
      bus.publish('init-complete')
      bus.publish('hack/hideinput')
      
    }
  };
})();

exports.app = app;

}}, ['svg', 'controlpanel', 'actions', 'nodes', 'trigger', 
    'relations', 'controls/panel', 'keybindings', 'undo', 'uiaction', 'ui']);
