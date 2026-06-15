from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

#-- Password hashing  verification functions --#
def hash_password(password: str):
    return pwd_context.hash(password)

#-- Password   verification functions --#
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
