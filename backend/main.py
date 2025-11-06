from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64
import time
from typing import Optional

app = FastAPI(title="AES Encryption/Decryption API")

# Enable CORS
# In production, update allow_origins with your frontend URL
FRONTEND_URL = os.environ.get("FRONTEND_URL", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL] if FRONTEND_URL != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EncryptionRequest(BaseModel):
    plaintext: str = Field(..., description="Text to encrypt")
    key: str = Field(..., description="AES key (base64 encoded or hex)")
    key_size: int = Field(128, description="Key size in bits (128, 192, or 256)")
    mode: str = Field("CBC", description="Encryption mode: CBC, GCM, or ECB")

class DecryptionRequest(BaseModel):
    ciphertext: str = Field(..., description="Ciphertext to decrypt (base64 encoded)")
    key: str = Field(..., description="AES key (base64 encoded or hex)")
    key_size: int = Field(128, description="Key size in bits (128, 192, or 256)")
    mode: str = Field("CBC", description="Encryption mode: CBC, GCM, or ECB")
    iv: Optional[str] = Field(None, description="IV for CBC/ECB modes (base64 encoded)")

class EncryptionResponse(BaseModel):
    ciphertext: str
    iv: Optional[str] = None
    execution_time_ms: float
    key_size: int
    mode: str

class DecryptionResponse(BaseModel):
    plaintext: str
    execution_time_ms: float
    key_size: int
    mode: str

def decode_key(key: str, key_size: int) -> bytes:
    """Decode key from base64 or hex string"""
    try:
        # Try base64 first
        decoded = base64.b64decode(key)
        if len(decoded) * 8 == key_size:
            return decoded
    except:
        pass
    
    try:
        # Try hex
        decoded = bytes.fromhex(key)
        if len(decoded) * 8 == key_size:
            return decoded
    except:
        pass
    
    # If both fail, try using the string directly (padded/truncated)
    key_bytes = key.encode('utf-8')
    if len(key_bytes) * 8 > key_size:
        key_bytes = key_bytes[:key_size // 8]
    elif len(key_bytes) * 8 < key_size:
        # Pad with zeros (not secure, but for demo purposes)
        key_bytes = key_bytes.ljust(key_size // 8, b'\0')
    
    return key_bytes

def pad_data(data: bytes) -> bytes:
    """Pad data for block cipher"""
    padder = padding.PKCS7(128).padder()
    return padder.update(data) + padder.finalize()

def unpad_data(data: bytes) -> bytes:
    """Unpad data after decryption"""
    unpadder = padding.PKCS7(128).unpadder()
    return unpadder.update(data) + unpadder.finalize()

@app.post("/encrypt", response_model=EncryptionResponse)
async def encrypt_data(request: EncryptionRequest):
    """Encrypt plaintext using AES"""
    start_time = time.time()
    
    try:
        # Validate key size
        if request.key_size not in [128, 192, 256]:
            raise HTTPException(status_code=400, detail="Key size must be 128, 192, or 256 bits")
        
        # Validate mode
        if request.mode not in ["CBC", "GCM", "ECB"]:
            raise HTTPException(status_code=400, detail="Mode must be CBC, GCM, or ECB")
        
        # Decode key
        key = decode_key(request.key, request.key_size)
        
        plaintext_bytes = request.plaintext.encode('utf-8')
        
        if request.mode == "GCM":
            # AES-GCM mode
            iv = os.urandom(12)  # 96-bit IV for GCM
            aesgcm = AESGCM(key)
            ciphertext = aesgcm.encrypt(iv, plaintext_bytes, None)
            iv_b64 = base64.b64encode(iv).decode('utf-8')
            ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
            
            execution_time = (time.time() - start_time) * 1000
            
            return EncryptionResponse(
                ciphertext=ciphertext_b64,
                iv=iv_b64,
                execution_time_ms=execution_time,
                key_size=request.key_size,
                mode=request.mode
            )
        
        elif request.mode == "CBC":
            # AES-CBC mode
            iv = os.urandom(16)  # 128-bit IV for CBC
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()
            
            padded_data = pad_data(plaintext_bytes)
            ciphertext = encryptor.update(padded_data) + encryptor.finalize()
            
            iv_b64 = base64.b64encode(iv).decode('utf-8')
            ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
            
            execution_time = (time.time() - start_time) * 1000
            
            return EncryptionResponse(
                ciphertext=ciphertext_b64,
                iv=iv_b64,
                execution_time_ms=execution_time,
                key_size=request.key_size,
                mode=request.mode
            )
        
        else:  # ECB mode
            # AES-ECB mode (not recommended for production, but included for demo)
            cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
            encryptor = cipher.encryptor()
            
            padded_data = pad_data(plaintext_bytes)
            ciphertext = encryptor.update(padded_data) + encryptor.finalize()
            
            ciphertext_b64 = base64.b64encode(ciphertext).decode('utf-8')
            
            execution_time = (time.time() - start_time) * 1000
            
            return EncryptionResponse(
                ciphertext=ciphertext_b64,
                iv=None,
                execution_time_ms=execution_time,
                key_size=request.key_size,
                mode=request.mode
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Encryption error: {str(e)}")

@app.post("/decrypt", response_model=DecryptionResponse)
async def decrypt_data(request: DecryptionRequest):
    """Decrypt ciphertext using AES"""
    start_time = time.time()
    
    try:
        # Validate key size
        if request.key_size not in [128, 192, 256]:
            raise HTTPException(status_code=400, detail="Key size must be 128, 192, or 256 bits")
        
        # Validate mode
        if request.mode not in ["CBC", "GCM", "ECB"]:
            raise HTTPException(status_code=400, detail="Mode must be CBC, GCM, or ECB")
        
        # Decode key
        key = decode_key(request.key, request.key_size)
        
        # Decode ciphertext
        ciphertext = base64.b64decode(request.ciphertext)
        
        if request.mode == "GCM":
            # AES-GCM mode
            if not request.iv:
                raise HTTPException(status_code=400, detail="IV is required for GCM mode")
            
            iv = base64.b64decode(request.iv)
            aesgcm = AESGCM(key)
            plaintext_bytes = aesgcm.decrypt(iv, ciphertext, None)
            plaintext = plaintext_bytes.decode('utf-8')
        
        elif request.mode == "CBC":
            # AES-CBC mode
            if not request.iv:
                raise HTTPException(status_code=400, detail="IV is required for CBC mode")
            
            iv = base64.b64decode(request.iv)
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()
            
            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            plaintext_bytes = unpad_data(padded_plaintext)
            plaintext = plaintext_bytes.decode('utf-8')
        
        else:  # ECB mode
            # AES-ECB mode
            cipher = Cipher(algorithms.AES(key), modes.ECB(), backend=default_backend())
            decryptor = cipher.decryptor()
            
            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()
            plaintext_bytes = unpad_data(padded_plaintext)
            plaintext = plaintext_bytes.decode('utf-8')
        
        execution_time = (time.time() - start_time) * 1000
        
        return DecryptionResponse(
            plaintext=plaintext,
            execution_time_ms=execution_time,
            key_size=request.key_size,
            mode=request.mode
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Decryption error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "AES Encryption/Decryption API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

