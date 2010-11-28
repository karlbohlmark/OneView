require.define({'facet': function(require, exports, module){
  /***
   * 
   */
  var facet = function(/*varargs*/){
    var args = arguments
    return function(obj){
      var i=0, o = {}
      for(i=0; i<args.length; i++){
        o[args[i]] = obj[args[i]]
      }
      return o
    }
  }

  exports.facet = facet 
}})

