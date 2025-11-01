const MIN_N = 12;
const MAX_N = 48;
let currentN = 24; // デフォルトは通常速度（1日が24時間）
let isSecondsVisible = true; // 秒数表示設定
let currentLang = 'ja'; // 言語設定

// ストップウォッチ関連の変数
let stopwatchStartTime = 0;
let stopwatchElapsedTime = 0;
let stopwatchTimer = null;
let lapTimes = [];

// ----------------------------------------------------
// 1. N値に基づいた時計の「速さ」調整ロジック (修正済み)
// ----------------------------------------------------

function calculateNTime(realTime) {
    // 速度係数 = 24 / N
    const speedFactor = 24 / currentN; 
    
    // 調整後のミリ秒 = リアルタイムのミリ秒 * 速度係数
    const adjustedMilliseconds = realTime * speedFactor;
    
    // N時間表示に変換
    const adjustedDayLengthMs = currentN * 60 * 60 * 1000; // N時間の総ミリ秒
    const secondsIntoN = Math.floor((adjustedMilliseconds % adjustedDayLengthMs) / 1000);

    const h = Math.floor(secondsIntoN / 3600);
    const m = Math.floor((secondsIntoN % 3600) / 60);
    const s = Math.floor(secondsIntoN % 60);
    
    return { h: h, m: m, s: s };
}

function updateClock() {
    // 省略 (前回のコードから変更なし)
    const now = new Date();
    const realTimeOfDay = now.getTime() - new Date(now.toDateString()).getTime(); 
    
    const { h, m, s } = calculateNTime(realTimeOfDay);
    
    const formattedH = String(h).padStart(2, '0');
    const formattedM = String(m).padStart(2, '0');
    const formattedS = String(s).padStart(2, '0');
    
    let timeString = `${formattedH}:${formattedM}`;
    if (isSecondsVisible) {
        timeString += `:${formattedS}`;
    }

    const clockDisplay = document.getElementById('n-clock-display');
    if (clockDisplay) {
        clockDisplay.textContent = timeString;
    }
    const nValueDisplay = document.getElementById('n-value-display');
    if (nValueDisplay) {
        nValueDisplay.textContent = `N = ${currentN} ${currentLang === 'ja' ? '時間' : 'Hours'}`;
    }
}

// ----------------------------------------------------
// 2. ストップウォッチ ロジック (新規追加)
// ----------------------------------------------------

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const s = String(totalSeconds % 60).padStart(2, '0');
    const msRemainder = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
    return `${h}:${m}:${s}.${msRemainder}`;
}

function updateStopwatch() {
    const now = Date.now();
    // ストップウォッチはN値に影響を受けず、常にリアルタイムで計測します。
    const elapsedTime = now - stopwatchStartTime + stopwatchElapsedTime;
    document.getElementById('stopwatch-display').textContent = formatTime(elapsedTime);
}

function startStopwatch() {
    if (!stopwatchTimer) {
        stopwatchStartTime = Date.now();
        stopwatchTimer = setInterval(updateStopwatch, 10); // 10ms ごとに更新
        document.getElementById('start-stop-btn').textContent = currentLang === 'ja' ? 'ストップ' : 'Stop';
        document.getElementById('start-stop-btn').classList.add('stop');
        document.getElementById('lap-reset-btn').textContent = currentLang === 'ja' ? 'ラップ' : 'Lap';
        document.getElementById('lap-reset-btn').classList.remove('reset');
    } else {
        clearInterval(stopwatchTimer);
        stopwatchElapsedTime += Date.now() - stopwatchStartTime;
        stopwatchTimer = null;
        document.getElementById('start-stop-btn').textContent = currentLang === 'ja' ? 'スタート' : 'Start';
        document.getElementById('start-stop-btn').classList.remove('stop');
        document.getElementById('lap-reset-btn').textContent = currentLang === 'ja' ? 'リセット' : 'Reset';
        document.getElementById('lap-reset-btn').classList.add('reset');
    }
}

function lapOrResetStopwatch() {
    if (stopwatchTimer) { // ラップ (計測中)
        const lapTime = Date.now() - stopwatchStartTime + stopwatchElapsedTime;
        lapTimes.push(lapTime);
        renderLaps();
    } else { // リセット (停止中)
        stopwatchStartTime = 0;
        stopwatchElapsedTime = 0;
        lapTimes = [];
        document.getElementById('stopwatch-display').textContent = formatTime(0);
        document.getElementById('lap-reset-btn').textContent = currentLang === 'ja' ? 'ラップ' : 'Lap';
        document.getElementById('lap-reset-btn').classList.remove('reset');
        renderLaps();
    }
}

function renderLaps() {
    const lapsList = document.getElementById('lap-list');
    if (!lapsList) return;
    
    lapsList.innerHTML = '';
    
    lapTimes.forEach((lap, index) => {
        const li = document.createElement('li');
        li.textContent = `${currentLang === 'ja' ? 'ラップ' : 'Lap'} ${lapTimes.length - index}: ${formatTime(lap)}`;
        lapsList.prepend(li);
    });
}


// ----------------------------------------------------
// 3. モードのレンダリング関数 (ストップウォッチ追加)
// ----------------------------------------------------

// ... renderClockMode(), renderAlarmMode(), renderSettingsMode() は変更なし（割愛）...

function renderStopwatchMode() {
    // 既存の計測状態を維持しつつDOMを再構築
    const displayTime = formatTime(stopwatchElapsedTime + (stopwatchTimer ? Date.now() - stopwatchStartTime : 0));
    
    document.getElementById('content-area').innerHTML = `
        <div class="mode-title">${currentLang === 'ja' ? 'ストップウォッチ' : 'Stopwatch'}</div>
        <div id="stopwatch-display" class="clock-display">${displayTime}</div>
        
        <div class="stopwatch-controls">
            <button id="lap-reset-btn" class="control-button gray-btn ${stopwatchTimer ? '' : (stopwatchElapsedTime > 0 ? 'reset' : '')}">
                ${stopwatchTimer ? (currentLang === 'ja' ? 'ラップ' : 'Lap') : (stopwatchElapsedTime > 0 ? (currentLang === 'ja' ? 'リセット' : 'Reset') : (currentLang === 'ja' ? 'ラップ' : 'Lap'))}
            </button>
            <button id="start-stop-btn" class="control-button ${stopwatchTimer ? 'stop' : 'start'}">
                ${stopwatchTimer ? (currentLang === 'ja' ? 'ストップ' : 'Stop') : (currentLang === 'ja' ? 'スタート' : 'Start')}
            </button>
        </div>
        
        <ul id="lap-list" class="lap-list">
            </ul>
    `;
    
    // イベントリスナーの再設定
    document.getElementById('start-stop-btn').addEventListener('click', startStopwatch);
    document.getElementById('lap-reset-btn').addEventListener('click', lapOrResetStopwatch);
    
    renderLaps();
}

// ... setupNControl(), setupSettings(), renderCurrentMode(), setupNavigation(), initApp() は変更なし（割愛）...
