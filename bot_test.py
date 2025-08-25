import requests
import threading
import random
import time

# Use your playit.gg URL (replace endpoints accordingly)
BASE_URL = "http://numbers-colony.gl.at.ply.gg:25300"
QUIZ_PAGE = f"{BASE_URL}/client"       # frontend
SUBMIT_URL = f"{BASE_URL}/submit"      # adjust if your backend endpoint is different

def simulate_user(user_id):
    try:
        print(f"User {user_id} joining the quiz...")

        # Each bot uses its own session (unique cookies)
        session = requests.Session()
        session.get(QUIZ_PAGE)

        # Example: 5 questions with random answers
        for q in range(1, 5 + 1):
            answer = random.choice(["A", "B", "C", "D"])
            payload = {"question_id": q, "answer": answer}
            res = session.post(SUBMIT_URL, data=payload)

            print(f"User {user_id} answered Q{q} with {answer} → {res.status_code}")
            time.sleep(random.uniform(0.5, 2))  # wait between answers

        print(f"User {user_id} finished the quiz!")

    except Exception as e:
        print(f"User {user_id} error: {e}")

# Run 25 bots
threads = []
for i in range(25):
    t = threading.Thread(target=simulate_user, args=(i,))
    threads.append(t)
    t.start()

for t in threads:
    t.join()

print("✅ All bots finished!")
