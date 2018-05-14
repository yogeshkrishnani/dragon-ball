(function () {
    'use strict';

    var dragonMovingOperationId;
    var playCanvasHeight, playCanvasWidth;
    var ballDirection, ballHeight, ballWidth;
    var currentTop, currentLeft, speed;
    var coinHeight, coinWidth, coinsPositions, timeAvail, timer;
    var score, highScore;

    $(document).ready(function () {

        init();
        generateFoodCoinsForDragon();
        play();

    });

    function init() {

        playCanvasHeight = $(".ball_play_canvas").height();
        playCanvasWidth = $(".ball_play_canvas").width();
        $(window).resize(function () {
            playCanvasHeight = $(".ball_play_canvas").height();
            playCanvasWidth = $(".ball_play_canvas").width();
        });

        ballDirection = {
            horizontal: "right",
            vertical: "bottom"
        };

        ballHeight = $(".dragon_ball").height();
        ballWidth = $(".dragon_ball").width();
        currentTop = parseInt($(".dragon_ball").css("top").split("px")[0]);
        currentLeft = parseInt($(".dragon_ball").css("left").split("px")[0]);
        speed = 0.5;
        coinHeight = coinWidth = 10;
        score = 0;
        coinsPositions = [];
        timeAvail = 1 * 60;

        if (localStorage.getItem("dragonBallHighScore") != null) {
            highScore = localStorage.getItem("dragonBallHighScore");
            $(".highScore").text("High Score: " + highScore + " Seconds");
        }

        initControls();

    }

    function initControls() {

        $(document).keydown(function (e) {
            if (e.keyCode == 38) {
                ballDirection.vertical = "top";
            } else if (e.keyCode == 40) {
                ballDirection.vertical = "bottom";
            } else if (e.keyCode == 37) {
                ballDirection.horizontal = "left";
            } else if (e.keyCode == 39) {
                ballDirection.horizontal = "right";
            }
        });

    }

    function generateFoodCoinsForDragon() {

        var coinTemplate = "<div class='foodCoins i##_index_##' style='top: ##_TOP_##;left: ##_LEFT_##'></div>";
        var coinFoods = "";

        for (var index = 0; index < 25; index++) {

            var coinPos = {
                top: Math.random() * (playCanvasHeight - 10),
                left: Math.random() * (playCanvasWidth - 10)
            }

            coinFoods += coinTemplate
                .replace(/##_index_##/g, (index + 1))
                .replace(/##_TOP_##/g, coinPos.top)
                .replace(/##_LEFT_##/g, coinPos.left);

            coinsPositions.push(coinPos);
        }

        $(".ball_play_canvas").append(coinFoods);

    }

    function play() {

        dragonMovingOperationId = setInterval(moveTheDragonBall, 1);
        startTimer(timeAvail, $(".timer"));

    }

    function startTimer(duration, display) {

        timer = duration;
        var minutes = parseInt(timer / 60, 10);
        var seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.text(minutes + ":" + seconds);

        var timerId = setInterval(function () {

            if (--timer < 0) {
                clearInterval(timerId);
                timeOver();
                return;
            }

            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.text(minutes + ":" + seconds);

        }, 1000);
    }

    function timeOver() {

        if (score < 25) {
            alert("Game Over!");
            window.location.reload(true);
        }

    }

    function moveTheDragonBall() {

        currentTop = parseFloat($(".dragon_ball").css("top").split("px")[0]);
        currentLeft = parseFloat($(".dragon_ball").css("left").split("px")[0]);

        changeBallDirectionIfReachedEnd();

        var pos = getNewPositionOfBall(ballDirection);

        $(".dragon_ball").css({
            top: pos.top,
            left: pos.left
        });

        eatCoinFoodIfAvail(pos);

    }

    function changeBallDirectionIfReachedEnd() {

        if (hasBallReachedBottom()) {

            ballDirection.vertical = "top";

        }
        else if (hasBallReachedRightEnd()) {

            ballDirection.horizontal = "left";

        }
        else if (hasBallReachedTop()) {

            ballDirection.vertical = "bottom";

        }
        else if (hasBallReachedLeftEnd()) {

            ballDirection.horizontal = "right";

        }

    }

    function eatCoinFoodIfAvail(dragonBallPos) {

        for (var index = 0; index < coinsPositions.length; index++) {

            var coinPos = coinsPositions[index];

            if (coinsPositions[index].hidden) {
                continue;
            }

            var coinAxis = {
                x: coinPos.left + (coinWidth / 2),
                y: coinPos.top + (coinHeight / 2),
                r: coinWidth / 2
            };
            var dragonAxis = {
                x: dragonBallPos.left + (ballWidth / 2),
                y: dragonBallPos.top + (ballHeight / 2),
                r: ballWidth / 2
            };

            var p1 = Math.pow((coinAxis.r - dragonAxis.r), 2);
            var p2 = Math.pow((coinAxis.x - dragonAxis.x), 2) + Math.pow((coinAxis.y - dragonAxis.y), 2);
            var p3 = Math.pow((coinAxis.r + dragonAxis.r), 2);

            if (p1 <= p2 && p2 <= p3) {

                eatCoin(index);

            }

        }

    }

    function eatCoin(index) {

        ballHeight = ballHeight + 1;
        ballWidth = ballWidth + 1;
        speed = speed + 0.05;

        (function (elem) {
            elem.fadeOut(100);
            setTimeout(function () {
                elem.remove();
            }, 300);
        })($(".foodCoins.i" + (index + 1)));

        $(".score").text((++score) + "/" + 25);
        $(".dragon_ball").height(ballHeight).width(ballWidth);
        coinsPositions[index].hidden = true;

        checkIfWon();

    }

    function checkIfWon() {

        setTimeout(function () {

            if (score > 24) {

                var highScore = localStorage.getItem("dragonBallHighScore");
                var completedIn = timeAvail - timer;

                alert("You Won! Completed In: " + completedIn + " Seconds");

                if (highScore == null || highScore > completedIn) {
                    highScore = completedIn;
                }

                localStorage.setItem("dragonBallHighScore", highScore);

                window.location.reload(true);
            }

        }, 100);

    }

    function getNewPositionOfBall(direction) {

        var pos = {};

        if (ballDirection.horizontal == "left") {

            pos.left = currentLeft - speed;

        }
        if (ballDirection.horizontal == "right") {

            pos.left = currentLeft + speed;

        }
        if (ballDirection.vertical == "top") {

            pos.top = currentTop - speed;

        }
        if (ballDirection.vertical == "bottom") {

            pos.top = currentTop + speed;

        }

        return pos;

    }

    function hasBallReachedTop() {

        if (currentTop < 2) {

            return true;

        }
        else {

            return false;

        }

    }

    function hasBallReachedLeftEnd() {

        if (currentLeft < 2) {

            return true;

        }
        else {

            return false;

        }

    }

    function hasBallReachedBottom() {

        var ballBottom = currentTop + ballHeight;

        if (ballBottom > playCanvasHeight) {

            return true;

        }
        else {

            return false;

        }

    }

    function hasBallReachedRightEnd() {

        var ballRightEnd = currentLeft + ballWidth;

        if (ballRightEnd > playCanvasWidth) {

            return true;

        }
        else {

            return false;

        }

    }

})();

