require.define(
  {
    'tests/html-test': function(require, exports, module){
      var  _ = require('html').dsl
        , div = _.div
        , dl = _.dl
        , equal = QUnit.equal
        , expect = QUnit.expect
      
      exports.tests = {
        'created div has correct tagName' : function(){
          var d = div()
          equal(d.toElement().tagName, 'DIV')
        },
        'div can be turned into html' : function(){
          var d = div()
          equal(d.toHtml(), '<div></div>')
        },
        'created dl has correct tagName' : function(){
          equal(dl().toElement().tagName, 'DL')
        },
        'dl can be turned into html' : function(){
          equal(dl().toHtml(), '<dl></dl>')
        },
        'can create div with child div' : function(){
          equal(div(div()).toHtml(), '<div><div></div></div>')
        }
      }
      
    }
  }
  , ['html']
)