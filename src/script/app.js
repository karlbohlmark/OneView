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
var edits = require('edits').edits;//new Lawnchair({table:'edits'})

bus.subscribe('command/clear', function(){
  nodes.nuke() && relations.nuke()
  document.location.reload()
})

var getRelationId = function(fromNode, toNode){
  return 'from=' + fromNode + '&to=' + toNode;
}

var app = (function(){
  var svgElem
    , handlers = {}
    , options = {
         nodeHeight : 120
       , nodeWidth  : 200
       , nodeColor  : '#202020'
       , nodeFill   : '#efefef'
      }
  ;
  
  require('actions').setOptions(options)
  
  var showMenu = (function(){
    var edit = svg.createElement('path', {'d':svgassets['edit-icon']})
      , g = svg.createElement('g')
    edit.setAttributeNS(null, 'style', 'display:none')
    edit.setAttributeNS(null, 'id', 'edit-icon')
    g.appendChild(edit)
    return function(nodeElement){
      if(document.getElementById('edit-icon')===null)
        nodeElement.parentNode.parentNode.appendChild(g)
    
      var matrix = nodeElement.parentNode.transform.animVal.getItem(0).matrix
      g.setAttributeNS(null, 'transform', 'translate(' + (parseInt(matrix.e) + 60) + ' ' + (parseInt(matrix.f) - 50) + ')')
      edit.setAttributeNS(null, 'style', 'display:block')
    }
  })()
  
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
  
  
  var undos = require('actions').undos
 
  return {
    run: function(parentElem){
      var thisApp = this
      svgElem = svg.createElement('svg')
      require('actions').setSvgElem(svgElem)    
      var panel = document.createElement('ul')
      panel.id="control-panel"
      
      
      controlPanel.commands.forEach(function(item){
        var li = document.createElement('li')
        li.innerHTML = item
        
        li.addEventListener('click', function(){
          bus.publish('command/clear')
        })
        
        panel.appendChild(li)  
      })
      
      
      parentElem.appendChild(panel)
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
      
      edits.length = 0 /* Currently, the initialization process adds items to the edits array -> clear it */
      
      bus.publish('hack/hideinput')
      
      
      document.onkeydown = function(ev){
        if(ev.which=='z'.charCodeAt(0) || ev.which=='Z'.charCodeAt(0)){
          var edit = edits.shift()
            , undoAction
          edit && (undoAction = undos[edit.eventName])
          undoAction && undoAction.call(this, edit)
          
          bus.publish('hack/hideinput')
        }
      }
    }
  };
})();

exports.app = app;

}}, ['svg', 'controlpanel', 'actions', 'edits', 'nodes', 'trigger', 'relations']);
