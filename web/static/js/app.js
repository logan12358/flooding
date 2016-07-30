// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".  //
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
import $ from "jquery"
import socket from "./socket"
import _ from "underscore"

import Two from "twojs-browserify"

const WATER_COLOR = '#283593';
let water, two, circles, circleCount;

let speed = 0.2;
let circleWidth = 80;

function setHeights(depth) {
  var height = (depth - 11) / (14 - 11);
  let newHeight = (1 - height) * two.height;
  water.translation.y = newHeight + two.height / 2;
  circles.translation.y = newHeight - circleWidth * 2;
}

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("data", {})
// let water = $("#water");
// let depth = $("#depth");

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) });

channel.on("update", payload => {
  setHeights(payload.depth);
});

var elem = document.getElementById('canvas');
two = new Two({ fullscreen: true }).appendTo(elem);

let centreX = two.width / 2;
let centreY = two.height / 2;
water = two.makeRectangle(centreX, centreY + 50, two.width, two.height);
water.fill = WATER_COLOR;
water.stroke = WATER_COLOR;

circleCount = (two.width / circleWidth) + 2;

circles = [];
for(var i = -1; i < circleCount; i++) {
  let circle = two.makeCircle(i * circleWidth, 100, circleWidth);
  circle.fill = '#ffffff';
  circle.stroke = '#ffffff';
  circles.push(circle);
}

circles = two.makeGroup(circles);

setHeights(12);


let maxWidth = circleCount * circleWidth;

two.bind('update', function(frameCount) {
  circles.translation.x += speed;
  circles.translation.x %= circleWidth;
}).play();

document.two = two;
