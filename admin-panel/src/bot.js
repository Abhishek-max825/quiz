(() => {
  const $ = (id) => document.getElementById(id);

  const logEl = $("log");
  const statsEl = $("stats");
  const botCountEl = $("botCount");
  const maxDelayEl = $("maxDelay");
  const autoStartEl = $("autoStart");
  const endpointEl = $("endpoint");

  let stopRequested = false;
  let runningBots = 0;
  let completedBots = 0;

  function base() {
    const v = (endpointEl.value || "").trim();
    return v || window.location.origin;
  }

  function api(path) {
    return `${base()}${path}`;
  }

  function log(msg, type = "info") {
    const ts = new Date().toLocaleTimeString();
    const line = `[${ts}] ${msg}\n`;
    logEl.textContent += line;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setStats() {
    statsEl.textContent = `Running: ${runningBots}  |  Completed: ${completedBots}  |  Stopped: ${stopRequested}`;
  }

  async function getStatus() {
    const r = await fetch(api('/api/status'));
    if (!r.ok) throw new Error(`status ${r.status}`);
    return r.json();
  }

  async function startQuiz() {
    try {
      const st = await getStatus();
      if (!st.quizLoaded) {
        log('No quiz loaded on server. Upload via Admin first.');
        return false;
      }
      if (st.quizInProgress) return true;
      const r = await fetch(api('/api/quiz/start'), { method: 'POST' });
      if (!r.ok) {
        log(`Start quiz failed: ${r.status}`);
        return false;
      }
      log('Quiz started.');
      return true;
    } catch (e) {
      log(`Start quiz error: ${e}`);
      return false;
    }
  }

  async function fetchQuiz(sessionFetch) {
    const r = await sessionFetch(api('/api/quiz'));
    if (!r.ok) throw new Error(`quiz ${r.status}`);
    return r.json();
  }

  function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }

  async function simulateBot(id, maxDelaySeconds) {
    runningBots += 1; setStats();
    try {
      const sessionFetch = async (url, opts = {}) => fetch(url, {
        credentials: 'same-origin',
        ...opts,
        headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
      });

      // connect client
      const rConnect = await sessionFetch(api('/api/client/connect'), {
        method: 'POST',
        body: JSON.stringify({ name: `WebBot ${id}` })
      });
      if (!rConnect.ok) {
        log(`Bot ${id}: connect failed ${rConnect.status}`);
        return;
      }
      const connectData = await rConnect.json();
      const clientId = connectData.clientId;
      let quiz = connectData.quizData;
      if (!quiz) quiz = await fetchQuiz(sessionFetch);

      const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
      if (!questions.length) {
        log(`Bot ${id}: no questions`);
        return;
      }

      const answers = [];
      const qTimes = [];
      for (const q of questions) {
        const optCount = Array.isArray(q.options) ? q.options.length : 0;
        const choice = optCount > 0 ? Math.floor(Math.random() * optCount) : 0;
        answers.push(choice);
        const delay = Math.max(0, Math.min(10, maxDelaySeconds));
        const spend = Math.floor(1000 + Math.random() * delay * 1000);
        qTimes.push(Math.max(1, Math.round(spend / 1000)));
        if (stopRequested) break;
        await sleep(spend);
      }

      if (stopRequested) {
        log(`Bot ${id}: stopped before submit`);
        return;
      }

      const payload = {
        clientId,
        answers,
        questionTimes: qTimes,
        timeTaken: qTimes.reduce((a,b)=>a+b,0)
      };

      const rSubmit = await sessionFetch(api('/api/client/submit'), {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (rSubmit.ok) {
        const data = await rSubmit.json();
        log(`Bot ${id}: submitted -> ${data.score}/${data.maxScore} (${data.percentage}%), ${data.timeTaken}s`);
      } else {
        const text = await rSubmit.text();
        log(`Bot ${id}: submit failed ${rSubmit.status} ${text}`);
      }
    } catch (e) {
      log(`Bot ${id} error: ${e}`);
    } finally {
      completedBots += 1; runningBots -= 1; setStats();
    }
  }

  async function runBots() {
    stopRequested = false; completedBots = 0; runningBots = 0; setStats();
    const count = Math.max(1, Math.min(200, Number(botCountEl.value || 1)));
    const maxDelay = Math.max(0, Math.min(10, Number(maxDelayEl.value || 5)));

    if (autoStartEl.checked) {
      const ok = await startQuiz();
      if (!ok) return;
    }

    log(`Launching ${count} bots (max ${maxDelay}s delay/question)`);
    const tasks = [];
    for (let i = 0; i < count; i++) tasks.push(simulateBot(i, maxDelay));
    await Promise.all(tasks);
    log('All bots finished.');
  }

  $("btnRun").addEventListener('click', runBots);
  $("btnClear").addEventListener('click', () => { logEl.textContent = ''; statsEl.textContent = 'Ready.'; });
  $("btnStop").addEventListener('click', () => { stopRequested = true; setStats(); log('Stop requested.'); });
  $("btnStartQuiz").addEventListener('click', startQuiz);

  // initial status probe
  getStatus().then(s => log(`Status: loaded=${s.quizLoaded}, inProgress=${s.quizInProgress}, questions=${s.numQuestions}`)).catch(e=>log(`Status check failed: ${e}`));
})();


