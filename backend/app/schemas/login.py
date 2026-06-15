from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class Token(BaseModel):
    access_token: str
    token_type: str
    
#this is to store the data we encoded in the token
class TokenData(BaseModel):
    id: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    mobile: str = Field(..., min_length=10, max_length=15)
    new_password: str = Field(..., min_length=8, max_length=255)
    confirm_password: str = Field(..., min_length=8, max_length=255)


class ForgotPasswordResponse(BaseModel):
    message: str
    
