import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

# Get DB URL from env
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://postgres:admin@localhost:5432/spendwise")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

def migrate():
    print(f"Migrating database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        try:
            # 1. Add user_id column
            print("Adding user_id column...")
            conn.execute(text("ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id VARCHAR"))
            conn.execute(text("CREATE INDEX IF NOT EXISTS ix_items_user_id ON items (user_id)"))
            
            # 2. Make receipt_id nullable
            print("Altering receipt_id to be nullable...")
            conn.execute(text("ALTER TABLE items ALTER COLUMN receipt_id DROP NOT NULL"))
            
            conn.commit()
            print("Migration successful! 🎉")
        except Exception as e:
            print(f"Migration failed: {e}")
            # Identify if it failed because column exists or constraint? 
            # create_engine default shouldn't fail on IF NOT EXISTS but ALTER COLUMN might if constraint mismatch.
            # But duplicate adding of column handled by IF NOT EXISTS.
            # Dropping constraint (NOT NULL) is safe usually.

if __name__ == "__main__":
    migrate()
