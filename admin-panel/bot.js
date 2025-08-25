async function runBot(id, baseUrl, maxDelay, log) {
    try {
      // Step 1: Join quiz
      let res = await fetch(baseUrl + "/api/client/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Bot" + id })
      });
      let data = await res.json();
      let clientId = data.clientId;
      log(`Bot${id} joined with ID ${clientId}`);
  
      // Step 2: Wait until quiz starts
      let quizStarted = false;
      let numQuestions = 0;
      while (!quizStarted) {
        let st = await fetch(baseUrl + "/api/status").then(r => r.json());
        if (st.quizInProgress) {
          quizStarted = true;
          numQuestions = st.numQuestions || 5;
          log(`Bot${id} → quiz started!`);
        } else {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
  
      // Step 3: Answer questions (simulate per-question timing)
      let answers = new Array(numQuestions).fill(-1);
      let questionTimes = new Array(numQuestions).fill(0);
      let lastIndex = -1;
  
      while (true) {
        let st = await fetch(baseUrl + "/api/status").then(r => r.json());
        if (!st.quizInProgress) {
          log(`Bot${id} detected quiz ended.`);
          break;
        }
  
        let idx = st.currentQuestionIndex;
        if (idx !== lastIndex && idx >= 0 && idx < numQuestions) {
          let ans = Math.floor(Math.random() * 4);
          answers[idx] = ans;
          questionTimes[idx] = Math.floor(Math.random() * maxDelay) + 1;
          log(`Bot${id} answered Q${idx + 1} with option ${ans}`);
          lastIndex = idx;
        }
  
        await new Promise(r => setTimeout(r, 1000));
      }
  
      // Step 4: Submit all answers
      let payload = {
        clientId,
        answers,
        timeTaken: questionTimes.reduce((a, b) => a + b, 0),
        questionTimes
      };
      let submitRes = await fetch(baseUrl + "/api/client/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      let submitData = await submitRes.json();
      log(`Bot${id} submitted → score=${submitData.score}, %=${submitData.percentage}`);
    } catch (err) {
      log(`Error for Bot${id}: ${err}`);
    }
  }
  