const API_BASE = window.location.origin;

let playerId = null;
let playerName = null;
let pollInterval = null;
let currentRoundId = null;

function joinGame(name) {
  fetch(API_BASE + '/api/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          showJoinError(data.error || 'Join failed');
        } else {
          playerId = data.player_id;
          playerName = data.name;
          onJoined();
          startPolling();
        }
      });
    })
    .catch(function(err) {
      showJoinError('Network error: ' + err.message);
    });
}

function onJoined() {
  document.getElementById('join-section').hidden = true;
  document.getElementById('game-section').hidden = false;
  document.getElementById('join-status').textContent = 'Joined as ' + playerName;
  document.getElementById('join-status').className = 'status';
}

function showJoinError(message) {
  const el = document.getElementById('join-status');
  el.textContent = message;
  el.className = 'status error';
}

function pollState() {
  fetch(API_BASE + '/api/state')
    .then(function(response) { return response.json(); })
    .then(function(data) {
      currentRoundId = data.round_id;
      document.getElementById('phase-display').textContent = 'Phase: ' + data.phase + '  Round ' + data.round_id + '/' + data.round_total;
      document.getElementById('prompt-display').textContent = data.prompt || '—';

      document.getElementById('answer-area').hidden = data.phase !== 'ANSWER';
      document.getElementById('guess-area').hidden = data.phase !== 'GUESS';
      document.getElementById('results-area').hidden = data.phase !== 'RESULTS';
    })
    .catch(function(err) {
      console.error('Poll error:', err);
    });
}

function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollState();
  pollInterval = setInterval(pollState, 2000);
}

function submitAnswer() {
  const answer = document.getElementById('answer').value.trim();
  if (!answer) return;

  fetch(API_BASE + '/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, round_id: currentRoundId, answer: answer })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          const el = document.getElementById('answer-status');
          el.textContent = data.error || 'Error submitting answer';
          el.className = 'status error';
        } else {
          document.getElementById('answer').value = '';
          document.getElementById('answer-status').textContent = 'Answer submitted';
          document.getElementById('answer-status').className = 'status';
        }
      });
    })
    .catch(function(err) {
      document.getElementById('answer-status').textContent = 'Network error: ' + err.message;
      document.getElementById('answer-status').className = 'status error';
    });
}

function submitGuess() {
  const guess = document.getElementById('guess').value.trim();
  if (!guess) return;

  fetch(API_BASE + '/api/guess', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player_id: playerId, round_id: currentRoundId, guess: guess })
  })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          const el = document.getElementById('guess-status');
          el.textContent = data.error || 'Error submitting guess';
          el.className = 'status error';
        } else {
          document.getElementById('guess').value = '';
          document.getElementById('guess-status').textContent = 'Guess submitted';
          document.getElementById('guess-status').className = 'status';
        }
      });
    })
    .catch(function(err) {
      document.getElementById('guess-status').textContent = 'Network error: ' + err.message;
      document.getElementById('guess-status').className = 'status error';
    });
}

function fetchResults() {
  fetch(API_BASE + '/api/results?round_id=' + currentRoundId)
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          document.getElementById('results').textContent = data.error || 'Results not available yet';
        } else {
          document.getElementById('results').textContent = JSON.stringify(data, null, 2);
        }
      });
    })
    .catch(function(err) {
      document.getElementById('results').textContent = 'Network error: ' + err.message;
    });
}

// UI wiring
document.getElementById('btn-join').addEventListener('click', function() {
  const name = document.getElementById('name').value.trim();
  if (!name) {
    showJoinError('Enter your name');
    return;
  }
  joinGame(name);
});

document.getElementById('btn-submit-answer').addEventListener('click', submitAnswer);
document.getElementById('btn-submit-guess').addEventListener('click', submitGuess);
document.getElementById('btn-fetch-results').addEventListener('click', fetchResults);

document.getElementById('btn-submit-answer').addEventListener('click', submitAnswer);
document.getElementById('btn-submit-guess').addEventListener('click', submitGuess);
document.getElementById('btn-fetch-results').addEventListener('click', fetchResults);
