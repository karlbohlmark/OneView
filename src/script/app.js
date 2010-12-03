require.define({'app':function(require, exports, module){

console.log('running app constructor')

var relations = require('relations').relations 
  , bus = require('eventbus').bus
  , nodes = require('nodes').nodes


var app = {
  run: function(parentElem){
    var thisApp = this
    console.log('running app.run')
    bus.publish('init-start')
    
    require('ui').init(parentElem)
    
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
}

exports.app = app;

}}, ['interaction', 'nodes', 
    'relations', 'keybindings', 'undo', 'uiaction', 'ui']);
