import traceback
import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

with open("err_new.txt", "w", encoding="utf-8") as f:
    try:
        response = client.post("/users/", json={
            "first_name": "test", 
            "last_name": "tester", 
            "username": "test_user_new", 
            "email": "testnew@example.com", 
            "password": "password123", 
            "role": "student", 
            "city": "Colombo", 
            "country": "Sri Lanka", 
            "mobile": "0771234567", 
            "school": "SLIIT"
        })
        f.write(f"STATUS CODE: {response.status_code}\n")
        f.write(f"RESPONSE BODY: {response.text}\n")
    except Exception as e:
        traceback.print_exc(file=f)
