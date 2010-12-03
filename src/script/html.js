require.define({
  'html': function(require, exports, module){
    var el = function(tagName, selfClose){
      var f = function(){
        var inner = tag(tagName, selfClose)
        inner.children = []
        var length = arguments.length
        for(var i = 0; i<length;i++){
          if(typeof arguments[i] =="string" || typeof arguments[i] =="number" || typeof arguments[i]=="object"){
            inner.children.push(arguments[i])
            continue
          }
          
          inner.children.push(arguments[i].inner)
        }
        
        var ret = function(){
          f.apply(null, arguments)
          return inner  
        }
        ret.inner = inner
        ret.toElement = toElement
        ret.toHtml = toHtml
        return ret
      }
      return f
    }
    
    var toElement = function(){
      var d = document.createElement('div')
      d.innerHTML = this.toHtml()
      return d.firstChild
    }
    
    var toHtml = function(){
      return html(this.inner)
    }
    
    var html = function(element){
      var buffer = ""
        , children = element.children
        , l = children &&  children.length
      if(typeof element== "string" || typeof element=="number")
        return element
       
      if(typeof element=="undefined")
        throw "Undefined element" 

      if(element.selfClose)
      {
        buffer+="<" + element.tagName
        var attrs = l && element.children[0]
        for(var p in attrs){
          buffer+= " " + p + '="' + attrs[p] + '"'  
        }
        buffer += '/>'
      }
      else
      {
        buffer += '<' + element.tagName +  '>'
        
        for(var i=0; i<l; i++){
          buffer+=html(children[i])  
        }
        
        buffer += '</' + element.tagName + '>'
      }
      return buffer
    }
    
    var tag = function(name, selfClose){
      return {
        type: 'tag',
        tagName: name,
        selfClose: !!selfClose
      }
    }
    
    
    var dsl = {
      el: el,
      dl: el('dl'),
      dt: el('dt'),
      dd: el('dd'),
      div: el('div'),
      input: el('input', true)
    }
    
    exports.dsl = dsl
  }
})
