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
    
    //Initialize the ui-widgets and place them in parentElem
    require('ui').init(parentElem)
    
    //Render the saved state by going through all nodes and relations and emitting the corresponding creation-events
    nodes.each(function(node){
      if(typeof node.push === "function" && node.length>0) node = node[0]
      bus.publish('nodecreated', node)
    })
    
    relations.each(function(relation){
      if(typeof relation.push === "function" && relation.length>0) relation = relation[0]
      bus.publish('relationcreated', relation)
    })
    
    //Give components an opportunity to inject behaviour when the app is initialized (Currently just used in interaction.js to clear the edits-array)
    bus.publish('init-complete')
    bus.publish('hack/hideinput')      
  }
}

exports.app = app;

//The first level dependencies of app.js should convey the high level facilities/services of the application
}}, ['interaction', 'nodes', 
    'relations', 'keybindings', 'undo', 'uiaction', 'ui']);
