var running = true,
    direction = 'bottom-right',
    drawSpeed = 1000,
    drawSpeedReductionPerRound = 200,
    roundDuration = 10000,
    timeElapsed = 0,
    gamePoints = 0,
    pointsEarnedPerCycle = 25,
    pointsRemovedPerPrematureBoing = 32,
    $lastBlip = $(),
    $newBlip = $(),
    tableSize = 5, // Tablesize should be set dynamically from this var
    userRequestedBoing = false;

$(function() {
  start();

  $('#top-left-control').click(function() {
    boingControlTopLeft();
  });
  $('#top-right-control').click(function() {
    boingControlTopRight();
  });
  $('#bottom-left-control').click(function() {
    boingControlBottomLeft();
  });
  $('#bottom-right-control').click(function() {
    boingControlBottomRight();
  });
});

function start() {
  running = true;
  updateTimerDisplay();
  draw();
}

function stop() {
  running = false;
}

function draw() {
  if (running) {
    setTimeout(function() {
        moveBlip();
        tick();
        draw();
    }, drawSpeed);
  }
}

function tick() {
  if (timeElapsed < roundDuration) {
    timeElapsed += 1000;
    updateTimerDisplay();
  } else {
    timeElapsed = 0;
    drawSpeed -= drawSpeedReductionPerRound;
  }
}

function moveBlip() {
  var $blip = $('td.blip').first();
  if (!userRequestedBoing) {
    setNewBlip();
  } else {
    userRequestedBoing = false;
  }
  $blip.toggleClass('blip');
  $newBlip.toggleClass('blip');
  if ($newBlip.length === 0) {
    gameOver();
    return;
  }
  $lastBlip = $blip;
  rewardWithPointsPerCycle();
}

function resetBlip() {
  // Remove any blips and adds one on the innitial location
}

function setNewBlip() {
  var $blip = $('td.blip').first();
  var possiblePaths = getPossiblePathsFor($blip);
  if (possiblePaths.length > 1) {
    var newBlip = possiblePaths[Math.floor(Math.random() * possiblePaths.length)];
  } else {
    var newBlip = possiblePaths[0];
  }
  $newBlip = $(newBlip);
}

function getPossiblePathsFor($blip) {
  var $adjacentRows = $(),
      $possiblePaths = $();

  switch (direction) {
  case 'bottom-right':
  case 'bottom-left':
    $adjacentRows = $blip.parents('tr').next();
    break;
  case 'top-right':
  case 'top-left':
    $adjacentRows = $blip.parents('tr').prev();
    break;
  case 'free':
    $adjacentRows = $blip.parents('tr').prev();
    $.merge($adjacentRows, $blip.parents('tr').next());
    break;
  }

  var blipIndexLeft = $blip.index() - 1;
  var blipIndexRight = $blip.index() + 2;

  if (blipIndexLeft < 0) {
    blipIndexLeft = 0;
  }

  if (blipIndexRight > tableSize) {
    blipIndexRight = tableSize;
  }

  // Get only the surrounding paths
  if (direction === 'free') {
    $adjacentRows.each(function(i, row) {
      $.merge($possiblePaths, $(row).find('td').slice(blipIndexLeft, blipIndexRight).filter('.path').not($lastBlip));
    });
  } else {
    $adjacentRows.each(function(i, row) {
      $.merge($possiblePaths, $(row).find('td').slice(blipIndexLeft, blipIndexRight).filter('.path'));
    });

    // From now on, the direction will be free
    direction = 'free';
  }

  return $possiblePaths;
}

function requestBoing() {
  userRequestedBoing = true;
  setNewBlip();
}

function boingControlTopLeft() {
  var $blip = $('td.blip');
  if (inTopLeftRegion($blip)) {
    direction = 'bottom-right';
    requestBoing();
  } else {
    penalizePrematureBoinger();
  }
}

function boingControlTopRight() {
  var $blip = $('td.blip');
  if (inTopRightRegion($blip)) {
    direction = 'bottom-left';
    requestBoing();
  } else {
    penalizePrematureBoinger();
  }
}

function boingControlBottomLeft() {
  var $blip = $('td.blip');
  if (inBottomLeftRegion($blip)) {
    direction = 'top-right';
    requestBoing();
  } else {
    penalizePrematureBoinger();
  }
}

function boingControlBottomRight() {
  var $blip = $('td.blip');
  if (inBottomRightRegion($blip)) {
    direction = 'top-left';
    requestBoing();
  } else {
    penalizePrematureBoinger();
  }
}

function inTopLeftRegion($blip) {
  var cellIndex = $blip.index(),
      rowIndex = $blip.parent('tr').index();
  return cellIndex === 0 &&
      rowIndex === 0;
}

function inTopRightRegion($blip) {
  var cellIndex = $blip.index(),
      rowIndex = $blip.parent('tr').index();
  return cellIndex === (tableSize - 1) &&
      rowIndex === 0;
}

function inBottomLeftRegion($blip) {
  var cellIndex = $blip.index(),
      rowIndex = $blip.parent('tr').index();
  return cellIndex === 0 &&
      rowIndex === (tableSize - 1);
}

function inBottomRightRegion($blip) {
  var cellIndex = $blip.index(),
      rowIndex = $blip.parent('tr').index();
  return cellIndex === (tableSize - 1) &&
      rowIndex === (tableSize - 1);
}

function rewardWithPointsPerCycle() {
  gamePoints += pointsEarnedPerCycle;
  updateGamePointsDisplay();
}

function updateGamePointsDisplay() {
  $('#game-points-amount').html(gamePoints);
}

function gameOver() {
  stop();
  $('#notification-wrapper').html('Game Over, Dude.');
}

function penalizePrematureBoinger() {
  gamePoints -= pointsRemovedPerPrematureBoing;
  updateGamePointsDisplay();
}

function updateTimerDisplay() {
  $('#game-timer').html((roundDuration - timeElapsed) / 1000);
}
