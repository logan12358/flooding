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

const WATER_COLOR = '#3949AB';
let water, two, circles, circleCount;

socket.connect()

// Now that you are connected, you can join channels with a topic:
let channel = socket.channel("data", {})

channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) });

if(!window.location.href.endsWith('admin')) {
  let DROPLET_SPEEDS = {
    dx: 1,
    dy: 2
  }

  let speed = 0.2;
  let circleWidth = 80;

  function setHeights(depth) {
    var height = (depth - 11) / (14 - 11);
    speed = height;
    let newHeight = (1 - height) * two.height;
    water.translation.y = newHeight + two.height / 2;
    circles.translation.y = newHeight - circleWidth * 2;
  }

  function makeFish(two, width, direction) {
    let height = width/6;
    let body = width*4/5;
    let fish = two.makeGroup(
      two.makePolygon(
        -body/5, 0,
        body/2-width, height,
        body/2-width, -height,
        false
      ),
      two.makeEllipse(0, 0, body/2, height),
      two.makeCircle(body/4, -height/3, 1)
    );
    fish.fill = 'orange';
    fish.linewidth=3;
    fish.stroke = 'red';

    return fish;
  }

  function fish_update(fish) {
    fish.translation.x += 2;
    if(fish.translation.x > two.width+100) {
      fish.translation.x = -100;
      fish.translation.y = two.height-Math.random()*100-50;
    }
  }

  channel.on("update", payload => {
    if(payload.depth) {
      setHeights(payload.depth);
      $('#depth').html(payload.depth);
      if(Number($('#yourlevel').html())<=payload.depth) {
        $('#depth').css('color', 'red');
      } else {
        $('#depth').css('color', '#EEE');
      }
    }
    if(payload.predicted) {
      console.log(payload.predicted);
      $('#predicted').html(payload.predicted);
      if(Number($('#yourlevel').html())<=payload.predicted) {
        $('#predicted').css('color', 'red');
      } else {
        $('#predicted').css('color', '#EEE');
      }
    }
  });

  var elem = document.getElementById('canvas');
  two = new Two({ fullscreen: true }).appendTo(elem);

  let centreX = two.width / 2;
  let centreY = two.height / 2;
  let background = two.makeRectangle(centreX, centreY, two.width, two.height);
  background.fill = '#2b2b2b';
  background.stroke = '#2b2b2b';
  water = two.makeRectangle(centreX, centreY + 50, two.width, two.height);
  water.fill = WATER_COLOR;
  water.stroke = WATER_COLOR;

  circleCount = (two.width / circleWidth) + 2;

  circles = [];
  for(var i = -1; i < circleCount; i++) {
    let circle = two.makeCircle(i * circleWidth, 100, circleWidth);
    circle.fill = '#2b2b2b';
    circle.stroke = '#2b2b2b';
    circles.push(circle);
  }

  circles = two.makeGroup(circles);

  setHeights(12);

  let fish = makeFish(two, 100, 'left');
  fish.translation.y = two.height-50;
  fish.translation.x = 0;

  let fishes = [fish];

  let maxWidth = circleCount * circleWidth;


  two.bind('update', function(frameCount) {
    circles.translation.x += speed;
    circles.translation.x %= circleWidth;
    for(var i=0; i < fishes.length; i++) {
      fish_update(fishes[i]);
    }
  }).play();

  particlesJS.load('particles', 'particles.json', function() {
    console.log('callback - particles.js config loaded');
  });
} else {
  $('#map-container').css('display', 'none');
  $('#admin').css('display', 'block');
  $('#level').on('mouseup', function(event) {
    $('#level-output')[0].value = $('#level')[0].value;
    channel.push("update", {depth: $('#level')[0].value});
  });
  $('#predicted-input').on('mouseup', function(event) {
    $('#predicted-output')[0].value = $('#predicted-input')[0].value;
    channel.push("update", {predicted: $('#predicted-input')[0].value});
  });
  channel.on("update", payload => {
    if(payload.depth) {
      $('#level')[0].value = payload.depth;
      $('#level-output')[0].value = $('#level')[0].value;
    }
    if(payload.predicted) {
      $('#predicted-input')[0].value = payload.predicted;
      $('#predicted-output')[0].value = $('#predicted-input')[0].value;
    }
  });
}
