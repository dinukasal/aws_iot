var awsIot = require('aws-iot-device-sdk');

var myThingName = 'e_meter_sub';

var thingShadows = awsIot.thingShadow({
   keyPath: './private.pem.key',   // path of private key
  certPath: './certificate.pem.crt', // path of certificate
    caPath: './rootCA.pem',  // path of root file
  clientId: myThingName,
    region: 'us-west-2'  // your region
});

mythingstate = {
  "state": {
    "reported": {
      "ip": "unknown"
    }
  }
}

var http = require("http");
var options = {
  hostname: '52.42.47.83',
  port: 3000,
  path: '/api/update',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
  }
};
var str='';


var networkInterfaces = require( 'os' ).networkInterfaces( );
//console.log(networkInterfaces);
mythingstate["state"]["reported"]["ip"] = networkInterfaces['wlp3s0'][0]['address'];

// PIR sensor connected to pin 7
// You can use any gpio pin 
// install npm button library first
//var Gpio = require('onoff').Gpio,
//button = new Gpio(7, 'in', 'both');

// json data for dynamoDB
var msg = "{\"key\":\"value\"}";

thingShadows.on('connect', function() {
  console.log("Connected...");
  console.log("Registering...");
  thingShadows.register( myThingName );

  // An update right away causes a timeout error, so we wait about 2 seconds
  setTimeout( function() {
    console.log("Updating my IP address...");
    clientTokenIP = thingShadows.update(myThingName, mythingstate);
    console.log("Update:" + clientTokenIP);
  }, 2500 );


  // Code below just logs messages for info/debugging
  thingShadows.on('status',
    function(thingName, stat, clientToken, stateObject) {
       console.log('received '+stat+' on '+thingName+': '+
                   JSON.stringify(stateObject));
    });

  thingShadows.on('update',
      function(thingName, stateObject) {
         console.log('received update '+' on '+thingName+': '+
                     JSON.stringify(stateObject));
      });

  thingShadows.on('delta',
      function(thingName, stateObject) {
         console.log('received delta '+' on '+thingName+': '+
                     JSON.stringify(stateObject));
      });

  thingShadows.on('timeout',
      function(thingName, clientToken) {
         console.log('received timeout for '+ clientToken)
      });

  thingShadows
    .on('close', function() {
      console.log('close');
    });
  thingShadows
    .on('reconnect', function() {
      console.log('reconnect');
    });
  thingShadows
    .on('offline', function() {
      console.log('offline');
    });
  thingShadows
    .on('error', function(error) {
      console.log('error', error);
    });
	
  
  //Watch for motion detection. high for any movement
/*
  button.watch(function(err, value) {
   console.log("Movement detected ")
   delete mythingstate['version']; //Cleanup to post to AWS
   mythingstate["state"]["reported"]["button"] = value
   buttonStateResponse = thingShadows.update(myThingName, mythingstate);
   thingShadows.publish('topic/test', value.toString()); // publish message
   console.log("Update:" + buttonStateResponse);
  });
*/

var message="{status:'active', lat:'81.1215',long:'101.254',temperature:'26'}";

	//mythingstate["state"]["reported"]["button"] = value
	//buttonStateResponse = thingShadows.update(myThingName, mythingstate);
	function publish(){
	    //thingShadows.publish('topic/test', value.toString()); // publish message
		//thingShadows.publish('topic/test', message); // publish message
		console.log('publishing: '+message);
	}
	
//setInterval(publish,1000);
	
thingShadows.subscribe('+/+');

thingShadows.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic.toString()+': '+message.toString());
	var obj=JSON.parse(message);
  
  var req = http.request(options, function(res) {
  console.log('Status: ' + res.statusCode);
  console.log('Headers: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (body) {
    console.log('Body: ' + body);
  });

  res.on('data', function (chunk) {
    str += chunk;
  });

  res.on('end', function () {
    console.log(req.data);
    console.log(str);
    // your code here if you want to use the results !
  });
});
req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
//req.write('{"string": "Hello, World"}');
//req.end();


  req.write(message);
  req.end();
	//console.log(obj.status);
  //client.end();
});


//req.end();

});
