require.define({
  'eventbus' : function(require, exports){
      subscriptions = {}
      
      var getSubscriptionList = function(topic){
        return subscriptions[topic] || (subscriptions[topic] = [])
      }
      
      exports.bus = {
        publish : function(topic, message){
          var subscribers = getSubscriptionList(topic)
          subscribers.forEach(
            function(subscriber){
              subscriber(message)
            }
          )
        },
        subscribe : function(topic, handler){
          getSubscriptionList(topic).push(handler)
        }
      }
  }
})
