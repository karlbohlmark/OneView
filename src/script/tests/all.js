require.define({
  'tests/all': function(require, exports){
    exports.run = function(){
      var module = QUnit.module
        , test = QUnit.test
        , asyncTest = QUnit.asyncTest
      
      var htmltests = require('tests/html-test').tests
      
      
      module("html");
      
      for(var name in htmltests){
        test(name, htmltests[name])
      }
      
      /*
      asyncTest("asynchronous test", function() {
          var that = this;
          setTimeout(function() {
              start();
              // Start have to be called in async function
              // No matter where
              equal(that.foobar, "setup");        
          }, 3000);
      });
      */
    }
  }
}, [ 
     'tests/html-test'
   ]
)
