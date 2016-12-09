var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyUSB0', {
    baudRate: 9600,
    parser: SerialPort.parsers.readline("\n")
});
var firebase = require('firebase');
var config = require('./config');

// Initialize Firebase
firebase.initializeApp(config);
var indoorAirRef = firebase.database().ref('data/users/geoffreyfloyd/logs/indoor-air');

var raw = [];
var lastMinute = null;
var lastData = null;
var lastDate = null;

// open errors will be emitted as an error event
port.on('error', function (err) {
    console.log('***********************');
    console.log('Error: ', err.message);
    console.log('***********************');
});

port.on('data', function (dataString) {
    var date = new Date();
    var data;

    // Abort if no data
    if (!dataString) {
        console.log('No data available');
        return;
    }

    try {
        data = JSON.parse(dataString);    
    }
    catch (ex) {
        console.log('***********************');
        console.log(ex);
        console.log('***********************');
        return
    }

    // Get timestamp
    var timestamp = date.toISOString();
    var minute = date.toISOString().slice(0, -8) + 'Z';
    if (lastMinute && lastMinute !== minute) {
        var total = raw.reduce((prev, curr) => {
            return {
                h: prev.h + curr.humidity,
                t: prev.t + curr.temperature
            };
        }, { t: 0, h: 0 });

        var avg = {
            h: Math.round((total.h / raw.length) * 100) / 100,
            t: Math.round((total.t / raw.length) * 100) / 100,
        };
        indoorAirRef.child(lastMinute).set(avg);
        // Flush raw
        raw = [];
    }

    // Add data to raw
    raw.push(data);

    // hold last date and data
    lastDate = date;
    lastData = data;
    lastMinute = minute;

    // Write to console
    console.log('Humidity: ', data.humidity, '\t Temperature: ' + data.temperature, '\t At: ' + timestamp);
});
