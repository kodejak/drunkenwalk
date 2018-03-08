/*
 * Project: "Bob's drunken walk"
 *
 * Description:
 *  Just a simple and funny random walk implementation with JavaScript.
 *
 * Author: Christian Handorf
 *
 * License:
 *  GNU General Public License v3 or later
 *
 * Copyright (c) 2018 kodejak
 */

function canvasObj(context, width, height) {
  this.ctx = context;
  this.w = width;
  this.h = height;

  return this;
}

function eventPoint(posX, posY) {
  this.x = posX;
  this.y = posY;

  return this;
}

function eventItem(point, realPoint, imgIdx, name, desc) {
  this.coords = point;
  this.realCoords = realPoint;
  this.index = imgIdx;
  this.name = name;
  this.desc = desc;
  this.done = false;

  return this;
}

class WalkDrawer {
  constructor(height, width) {
    this.blockW = 60;
    this.blockH = 60;
    this.canvasW = width;
    this.canvasH = height;
    this.blockColor = "#F3E2A9";
    this.streetColor = "#444";
    this.walkwayColor = "#BBB";
    this.streetWidth = 8;
    this.walkwayWidth = 2;
    this.blockCountX = Math.floor(this.canvasW / this.blockW);
    this.blockCountY = Math.floor(this.canvasH / this.blockH);
    this.beerCount = Math.floor(this.blockCountX * this.blockCountY * 5 / 100);
    this.pukeCount = Math.floor(this.blockCountX * this.blockCountY * 1 / 100);
    this.peeCount = Math.floor(this.blockCountX * this.blockCountY * 2 / 100);
    this.maxCanvas = 4;
    this.maxBuildings = 8;
    this.maxEventImgs = 3;
    this.mapImgNames = new Array("cap.png", "startmark.png", "goalmark.png", "thinkbubble.png");
    this.IDX_CAP = 0;
    this.IDX_START = 1;
    this.IDX_GOAL = 2;
    this.IDX_THINK = 3;
    this.stepSize = 1;
    this.stepSpeed = 170;
    this.finished = false;
    this.blockspassed = 0;
    this.MIN_PER_BLOCK = 1.2;
    this.startTime = new Date(2018, 0, 1,  1, 15);
    this.currTime = null;

    this.initUi();
  }

  initUi() {
    this.showIntro();
    this.loadCanvases();
    this.loadBuildings();
    this.loadEventIcons();
    this.loadMapImages();
    this.generateStartEnd();
    this.generateEvents();
    this.hideRestart();
    this.hideMenu();
    this.closeMenu();
  }

  loadBuildings() {
    this.buildings = new Array();
    for (var i = 0; i < this.maxBuildings; i++) {
      var img = new Image();
      var num = i+1;
      img.src = "./img/b" + num.toString() + ".png";
      this.buildings[i] = img;
    }
  }

  loadMapImages() {
      this.mapImgs = new Array();
      for (var i = 0; i < this.mapImgNames.length; i++) {
        var tmpImg = new Image();
        tmpImg.src = "./img/" + this.mapImgNames[i];
        this.mapImgs[i] = tmpImg;
      }
  }

  loadEventIcons() {
    this.eventImgs = new Array();
    for (var i = 0; i < this.maxEventImgs; i++) {
      var img = new Image();
      var num = i+1;
      img.src = "./img/event" + num.toString() + ".png";
      this.eventImgs[i] = img;
    }
  }

  loadCanvases() {
    this.canvasLayer = new Array();
    for (var i = 0; i < this.maxCanvas; i++) {
      var c = document.getElementById("canvasLayer" + i.toString());
      var ctx = c.getContext("2d");
      c.width = this.canvasW;
      c.height = this.canvasH;
      var cObj = new canvasObj(ctx, this.canvasW, this.canvasH);
      this.canvasLayer[i] = cObj;
    }

  }

  generateStartEnd() {
    var x = this.getRandomRange(1, this.blockCountX);
    var y = this.getRandomRange(1, this.blockCountY);
    this.startPoint = new eventPoint(x, y);
    this.movingPoint = this.startPoint;

    x = this.getRandomRange(1, this.blockCountX);
    y = this.getRandomRange(1, this.blockCountY);
    this.endPoint = new eventPoint(x, y);
  }

  generateEvent(name, desc, imgIdx, count) {
    for (var i = this.eventCount; i < this.eventCount + count; i++) {
      var x = this.getRandomRange(1, this.blockCountX);
      var y = this.getRandomRange(1, this.blockCountY);
      var point = new eventPoint(x, y);
      var realPoint = new eventPoint(x, y);
      realPoint = this.translateCoords(realPoint);
      this.events[i] = new eventItem(point, realPoint, imgIdx, name, desc);
    }
    this.eventCount  += count;
  }

  generateEvents() {
    this.events = new Array();
    this.eventCount = 0;

    this.generateEvent("beer", "Bob buyed one beer called \"Wegbier\"", 0, this.beerCount);
    this.generateEvent("puke", "Bob puked at a bus station", 1, this.pukeCount);
    this.generateEvent("piss", "Bob pissed behind a corner of a house", 2, this.peeCount);
  }

  checkEvent(point, done) {
    for (var i = 0; i < this.eventCount; i++) {
      var tmpEvent = this.events[i];

      if (this.pointEqual(tmpEvent.coords, point) && tmpEvent.done == false) {
        if (done === true) {
          tmpEvent.done = true;
        }
        this.events[i] = tmpEvent;
        return tmpEvent;
      }
    }

    return null;
  }

  drawEvent(aEvent) {
    this.canvasLayer[1].ctx.drawImage(this.mapImgs[this.IDX_THINK], aEvent.realCoords.x, aEvent.realCoords.y - 55, 64, 55);
    this.canvasLayer[1].ctx.drawImage(this.eventImgs[aEvent.index], aEvent.realCoords.x + 15, aEvent.realCoords.y - 42, 30, 30);
    this.addMessage(aEvent.desc);
  }

  translateCoords(point) {
    var tmpPoint = new eventPoint(point.x * this.blockW, point.y * this.blockH);
    return tmpPoint;
  }

  pointEqual(pointA, pointB) {
    if (pointA.x == pointB.x && pointA.y == pointB.y) {
      return true;
    }

    return false;
  }

  drawBuildings() {
    for (var i = 0; i < this.canvasW; i += this.blockW) {
      for (var j = 0; j < this.canvasH; j += this.blockH) {
        var num = this.getRandomRange(1, this.maxBuildings);
        this.canvasLayer[0].ctx.fillStyle = this.walkwayColor;
        this.canvasLayer[0].ctx.fillRect(Math.floor(i+this.streetWidth/2)-this.walkwayWidth, Math.floor(j+this.streetWidth/2)-this.walkwayWidth, this.blockW-this.streetWidth+this.walkwayWidth, this.blockH-this.streetWidth+this.walkwayWidth);
        this.canvasLayer[0].ctx.drawImage(this.buildings[num], Math.floor(i+this.streetWidth/2), Math.floor(j+this.streetWidth/2), this.blockW-this.streetWidth-this.walkwayWidth, this.blockH-this.streetWidth-this.walkwayWidth);
      }
    }
  }

  drawBackground() {
    this.canvasLayer[0].ctx.fillStyle = this.streetColor;
    this.canvasLayer[0].ctx.fillRect(0, 0, this.canvasW, this.canvasH);
  }

  drawStartEnd() {
    var start = this.translateCoords(this.startPoint);
    var end = this.translateCoords(this.endPoint);
    this.canvasLayer[2].ctx.drawImage(this.mapImgs[this.IDX_START], start.x - 11, start.y - 35, 22, 35);
    this.canvasLayer[2].ctx.drawImage(this.mapImgs[this.IDX_GOAL], end.x - 11, end.y - 35, 22, 35);

  }

  drawLine(pointA, pointB) {
    this.canvasLayer[0].ctx.beginPath();
    this.canvasLayer[0].ctx.moveTo(pointA.x - this.walkwayWidth/2, pointA.y- this.walkwayWidth/2);
    this.canvasLayer[0].ctx.lineTo(pointB.x- this.walkwayWidth/2, pointB.y- this.walkwayWidth/2);
    this.canvasLayer[0].ctx.strokeStyle = this.wayColor;
    this.canvasLayer[0].ctx.lineWidth = 2;
    this.canvasLayer[0].ctx.closePath();
    this.canvasLayer[0].ctx.stroke();
  }

  drawPosition(point) {
    this.canvasLayer[3].ctx.clearRect(0, 0, this.canvasLayer[3].w, this.canvasLayer[3].h);
    this.canvasLayer[3].ctx.drawImage(this.mapImgs[this.IDX_CAP], point.x- 12, point.y - 12, 25, 25);
  }

  draw() {
    this.drawBackground();
    this.drawBuildings();
    this.drawStartEnd();
  }

  makeSteps() {
    if (this.finished == true) {
      return;
    }

    while(true) {
      var destPoint = new eventPoint(this.movingPoint.x, this.movingPoint.y);
      var step = this.getRandomRange(0, 4);

      if (step == 0) {
        destPoint.x = this.movingPoint.x + this.stepSize;
        destPoint.y = this.movingPoint.y;
        if (destPoint.x > this.blockCountX) {
          continue;
        }
        this.wayColor = "#0F0";
      } else if (step == 1) {
        destPoint.x = this.movingPoint.x - this.stepSize;
        destPoint.y = this.movingPoint.y;
        if (destPoint.x < 0) {
          continue;
        }
        this.wayColor = "#FFFF00";
      } else if (step == 2) {
        destPoint.x = this.movingPoint.x;
        destPoint.y = this.movingPoint.y + this.stepSize;
        if (destPoint.y > this.blockCountY) {
          continue;
        }
        this.wayColor = "#FF00FF";
      } else if (step == 3) {
        destPoint.x = this.movingPoint.x;
        destPoint.y = this.movingPoint.y - this.stepSize;
        if (destPoint.y < 0) {
          continue;
        }
        this.wayColor = "#00FFFF";
      }

      this.drawLine(this.translateCoords(this.movingPoint), this.translateCoords(destPoint));
      this.drawPosition(this.translateCoords(destPoint));
      this.movingPoint = destPoint;
      this.blockspassed++;

      this.currTime = new Date(this.startTime);
      this.currTime.setMinutes(this.currTime.getMinutes() + (this.blockspassed * this.MIN_PER_BLOCK));

      if (this.pointEqual(this.movingPoint, this.endPoint)) {
        this.stop();
        this.addMessage("Bob reached the hotel");
        var timeNeeded = this.blockspassed * this.MIN_PER_BLOCK / 60.0;
        this.addMessage("Bob passed " + this.blockspassed + " blocks in " + timeNeeded.toFixed(1) + " h", false);
        if (Math.floor(this.blockspassed * this.MIN_PER_BLOCK) > 180) {
          this.addMessage("Don't be like Bob!", false);
        }

        this.showRestart();
        this.openMenu();

        return;
      }

      if (this.pointEqual(this.movingPoint, this.startPoint)) {
          this.addMessage("Bob passed his starting point again");
      } else {
          var tmpEvent = this.checkEvent(this.movingPoint, true);
          if (tmpEvent != null) {
            this.drawEvent(tmpEvent);
          }
      }

      break;
    }
  }

  start() {
    this.currTime = new Date(this.startTime);
    this.generateEvents();
    this.clearMessages();
    this.showMessages();
    this.addMessage("Distance to goal are " + this.getGoalDistance(this.startPoint, this.endPoint) + " blocks", false);
    this.addMessage("Bob started his walk");
    this.finished = false;
    this.blockspassed = 0;
    var self = this;
    if (this.finished == false) {
      this.timer = setInterval(function(){ self.makeSteps() }, this.stepSpeed);
    }
  }

  stop() {
    this.finished = true;
    clearInterval(this.timer);
  }

  startWalk() {
    this.hideIntro();
    this.showMenu();
    this.draw();
    this.start();
  }

  restartWalk() {
    this.hideIntro();
    this.showMenu();
    this.clearScene();
    this.generateStartEnd();
    this.draw();
    this.hideRestart();
    this.start();
  }

  clearScene() {
    for (var i = 0; i < this.maxCanvas; i++) {
      this.canvasLayer[i].ctx.clearRect(0, 0, this.canvasLayer[i].w, this.canvasLayer[i].h);
    }
  }

  getTimeString() {
    var str = ((this.currTime.getHours() < 10)?"0":"") + this.currTime.getHours() + ":" + ((this.currTime.getMinutes() < 10)?"0":"") + this.currTime.getMinutes();
    return str;
  }

  getGoalDistance(pointA, pointB) {
    var dist = Math.abs(pointB.x - pointA.x) + Math.abs(pointB.y - pointA.y);
    return dist;
  }

  getRandomRange(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
  }

  hideIntro() {
    $("#overlay").hide();
  }

  showIntro() {
    $("#overlay").show();
  }

  hideRestart() {
    $("#buttonRestart").hide();
  }

  showRestart() {
    $("#buttonRestart").show();
  }

  showMenu() {
    $("#navigation").show();
  }

  hideMenu() {
    $("#navigation").hide();
  }

  openMenu() {
    if ($(".menu-opener").hasClass("active") == true) {
      return;
    }

    $(".menu-opener, .menu-opener-inner, .menu, .content").toggleClass("active");
    if ($(".content").hasClass("show") == false) {
      var self = this;
      setTimeout(function () {
        $(".content").addClass("show");
        self.scrollMessages();
      }, 300);
    }
  }

  closeMenu() {
    if ($(".menu-opener").hasClass("active") == false) {
      return;
    }

    $(".menu-opener, .menu-opener-inner, .menu, .content").toggleClass("active");
    if ($(".content").hasClass("show") == true) {
      $(".content").removeClass("show");
    }
  }

  clearMessages() {
    $("#textarea").val("");
  }

  showMessages() {
    $("#textarea").show();
  }

  hideMessages() {
    $("#textarea").hide();
  }

  scrollMessages() {
    $('textarea#textarea').scrollTop($('textarea#textarea')[0].scrollHeight);
  }

  addMessage(str, withtime = true) {
    var text = $("textarea#textarea").val();
    var tmp;

    if (withtime) {
      tmp = this.getTimeString() + " ";
    } else {
      tmp = "";
    }
    text += tmp + str + "\n";
    $("textarea#textarea").val(text);

    this.scrollMessages();
  }
}
