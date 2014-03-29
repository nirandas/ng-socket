An angularjs wrapper for SockJS

##installation
Include ng-socket as a dependency for your app

	angular.module("your-app-name", [.... , "ng-socket", ....]);

Then configure the socket (address, reconnectInterval etc)

	angular.module("your-app-name").config(function($socketProvider){
		$socketProvider.configure({
			address: "http address to the sockjs server",
			// other  configurations ...
		});
	});

Start the socket, mostly in your app's run block:

	angular.module("your-app-name").run(function($socket){
		$socket.start();
	});


## Using $socket

Once configured and started, all received messages will be parsed according to the provided parser or using the default parser and broadcasted on $rootScope. ng-socket rate limits the broadcasts to twice a second and runs the $broadcast in a $apply function.

###Subscribing

To subscribe to received messages:

	$socket.on("event-name", function(event, data){
		// process the data here
	});

This is a shortcut to listening for the event on $rootScope. Optionally you could pass a third parameter (a scope) which will be used instead of $rootScope. For example in your controller:

	$socket.on("event-name", function(event, data){
		// process the data here
	}, $scope);


###Sending messages

To send messages to the server:

	$socket.send("event-name", data);

##Parsers and Formatters

ng-socket runs each received message through a parser function and each message to be sent through a formatter function. You could replace these function while configuring $socketProvider to implement your own messaging format. The default parser and formatter is defined as follows:

	function parser(msg){
		return angular.fromJson(msg);
	}

	function formatter(event, data){
		return angular.toJson([event, data]);
	}

The parser function will receive a string and should return an array with two elements, event and data. Whereas the formatter receives event and data as arguments and should return the string to be sent to the server.
