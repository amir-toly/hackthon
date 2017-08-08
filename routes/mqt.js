var mqtt = require('mqtt');
var options = {
    port: process.env.MQTT_PORT,
    host: 'mqtt://m12.cloudmqtt.com',
    clientId: 'mqttjs_' + Math.random().toString(16).substr(2, 8),
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8',
    qos: 1
};


module.exports = {

    startAndPush: function (topic, message) {

        var client = mqtt.connect('mqtt://m12.cloudmqtt.com', options);
        client.on('connect', function() { // When connected
            console.log('connected');
            // subscribe to a topic
//            client.subscribe('/refresh', function() {
//                // when a message arrives, do something with it
//                client.on('message', function(topic, message, packet) {
//                    console.log("Message. Received '" + message + "' on refresh'");
//                });
//            });
//
//            // subscribe to a topic
//            client.subscribe('/topic/transactions', function() {
//                // when a message arrives, do something with it
//                client.on('message', function(topic, message, packet) {
//                    console.log("Xn Received '" + message + "' on '" + topic + "'");
//                });
//            });
//
//            // subscribe to a topic
//            client.subscribe('/topic/balances', function() {
//                // when a message arrives, do something with it
//                client.on('message', function(topic, message, packet) {
//                    console.log("Bals. Received '" + message + "' on '" + topic + "'");
//                });
//            });

            // publish a message to a topic
            client.publish(topic, message, 1, function() {
                console.log("Message is published to:" + topic);
                client.end(); // Close the connection when published
            });
        });

    }

}