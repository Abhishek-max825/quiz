import requests
import threading
import random
import time

BASE_URL = "http://numbers-colony.gl.at.ply.gg:25300"

JOIN_URL = f"{BASE_URL}/api/client/connect"
STATUS_URL = f"{BASE_URL}/api/status"
SUBMIT_URL = f"{BASE_URL}/api/client/submit"

def simulate_user(user_id):
    try:
        session = requests.Session()
        username = f"Bot{user_id}"

        # Step 1: Join quiz
        res = session.post(JOIN_URL, json={"name": username})
        if res.status_code != 200:
            print(f"{username} failed to join → {res.text}")
            return
        client_id = res.json().get("clientId")
        print(f"{username} joined with ID {client_id}")

        # Step 2: Wait until quiz starts
        num_questions = 0
        while True:
            status = session.get(STATUS_URL).json()
            if status.get("quizInProgress"):
                print(f"{username} → quiz started!")
                num_questions = status.get("numQuestions", 5)
                break
            time.sleep(2)

        # Step 3: Answer each question as they come
        answers = [-1] * num_questions
        question_times = [0] * num_questions
        last_index = -1

        while True:
            status = session.get(STATUS_URL).json()
            if not status.get("quizInProgress"):
                print(f"{username} detected quiz ended.")
                break

            current_index = status.get("currentQuestionIndex", -1)

            if current_index != last_index and 0 <= current_index < num_questions:
                # New question available → answer it
                chosen = random.randint(0, 3)
                answers[current_index] = chosen
                question_times[current_index] = random.randint(1, 4)
                print(f"{username} answered Q{current_index+1} with option {chosen}")
                last_index = current_index

            time.sleep(1)

        # Step 4: Submit all answers
        payload = {
            "clientId": client_id,
            "answers": answers,
            "timeTaken": sum(question_times),
            "questionTimes": question_times
        }

        res = session.post(SUBMIT_URL, json=payload)
        print(f"{username} final submit → {res.status_code}, {res.json()}")

    except Exception as e:
        print(f"Error for {username}: {e}")

# Launch 25 bots
threads = []
for i in range(25):
    t = threading.Thread(target=simulate_user, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("✅ All bots finished!")
