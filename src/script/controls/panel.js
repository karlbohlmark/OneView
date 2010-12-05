require.define({
  'controls/panel': function(require, exports, module){
    var panel = function(){
      var ul = document.createElement('ul')
      var F = function(){}
      F.prototype = panel.prototype
      var o = new F()
      o._ul = ul
      return o
    }
    
    panel.prototype.addItem = function(item){
      var li = document.createElement('li')
      li.innerHTML = item.name
      li.addEventListener('click', item.action, true)
      this._ul.appendChild(li)
    }
    
    panel.prototype.getDomElement = function(){
      if(this.id)
        this._ul.id = this.id
      return this._ul
    }
    
    exports.panel = panel
  }
})
