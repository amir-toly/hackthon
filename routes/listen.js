var Refresh = require('./refresh');
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

    keepListening: function () {

        var client = mqtt.connect('mqtt://m12.cloudmqtt.com', options);
        client.on('connect', function() { // When connected
            console.log('connected to listen');
            // subscribe to a topic
            client.subscribe('/refresh', function() {
                // when a message arrives, do something with it
                client.on('message', function(topic, deviceId, packet) {
                    console.log("Message. Received '" + deviceId + "' on refresh'");
                    Refresh.handleRefresh(deviceId);
                });
            });
        });

    }

}