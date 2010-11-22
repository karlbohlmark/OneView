require.define({
  'controls/nodemenu': function(require, exports, module){
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
    exports.showMenu = showMenu
  }
})
