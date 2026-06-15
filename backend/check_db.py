from app.db.database import engine
from sqlalchemy import text

def main():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
            tables = [row[0] for row in result]
            for t in tables:
                print(t)
    except Exception as e:
        print("ERROR:", e)

if __name__ == "__main__":
    main()
