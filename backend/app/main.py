from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import jwt
import datetime
import json
from passlib.context import CryptContext
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

SECRET_KEY = "plastic-tree-secret-key-2024"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def get_db():
    db = sqlite3.connect("/data/app.db")
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA journal_mode=WAL")
    return db


def init_db():
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT DEFAULT '',
            phone TEXT DEFAULT '',
            address TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            year INTEGER,
            price REAL NOT NULL,
            description TEXT,
            image_url TEXT,
            tracklist TEXT,
            genre TEXT DEFAULT '',
            format TEXT DEFAULT 'CD'
        );
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        );
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total REAL NOT NULL,
            status TEXT DEFAULT 'completed',
            items TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    count = db.execute("SELECT COUNT(*) FROM products").fetchone()[0]
    if count == 0:
        products = [
            ("Single Collection", "Plastic Tree", 1998, 2800, "Сборник синглов Plastic Tree — ключевые треки раннего периода группы, объединённые в одном издании.", "/images/concept-singles.png", '["1. 割れた窓","2. 本当の嘘","3. 絶望の丘","4. トレモロ","5. Sink","6. ツメタイヒカリ","7. スライド.","8. ロケット","9. プラネタリウム","10. 鳴り響く、鐘","11. アブストラクト マイ ライフ","12. パノラマ","13. 「月世界」","14. ブランコから","15. オルガン.","16. プラネタリウム（98 Version）","17. 液体（98 Version）"]', "Alternative Rock"),
            ("剥製", "Plastic Tree", 2019, 3200, "13-й студийный альбом Plastic Tree. Глубокий и атмосферный релиз с тёмным, меланхоличным звучанием.", "/images/concept-hakusei.png", '["1. ○生物","2. フラスコ","3. マイム","4. ハシエンダ","5. 告白","6. インソムニアブルース","7. float","8. 落花","9. スラッシングパンプキン・デスマーチ","10. スロウ","11. 剥製","12. ●静物"]', "Alternative Rock"),
            ("Plastic Tree", "Plastic Tree", 2024, 3500, "Новый одноимённый альбом группы. Экспериментальное звучание, сочетающее классический стиль с новыми текстурами.", "/images/concept-plastictree.png", '["1. ライムライト","2. ざわめき","3. no rest for the wicked","4. ゆうえん","5. シカバネーゼ","6. 宵闇","7. Invisible letter","8. 痣花","9. メルヘン","10. 夢落ち"]', "Alternative Rock"),
            ("Parade", "Plastic Tree", 2000, 2500, "3-й студийный альбом. Один из самых культовых релизов группы с красивым, меланхоличным звучанием.", "/images/concept-parade.png", '["1. エーテル","2. ロケット","3. スライド.","4. 少女狂想","5. ベランダ.","6. 空白の日","7. 十字路","8. トレモロ","9. 睡眠薬","10. bloom","11. Sink","12. そしてパレードは続く"]', "Alternative Rock"),
        ]
        db.executemany(
            "INSERT INTO products (title, artist, year, price, description, image_url, tracklist, genre) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            products
        )
    db.commit()
    db.close()


@app.on_event("startup")
async def startup():
    init_db()


def create_token(user_id: int) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=30)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None


class CartItemRequest(BaseModel):
    product_id: int
    quantity: int = 1


class CheckoutRequest(BaseModel):
    payment_method: str = "card"


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/register")
async def register(req: RegisterRequest):
    db = get_db()
    existing = db.execute("SELECT id FROM users WHERE email = ?", (req.email,)).fetchone()
    if existing:
        db.close()
        raise HTTPException(status_code=400, detail="Email already registered")
    password_hash = pwd_context.hash(req.password)
    cursor = db.execute(
        "INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)",
        (req.email, req.username, password_hash)
    )
    db.commit()
    user_id = cursor.lastrowid
    token = create_token(user_id)
    db.close()
    return {"token": token, "user": {"id": user_id, "email": req.email, "username": req.username}}


@app.post("/api/login")
async def login(req: LoginRequest):
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
    db.close()
    if not user or not pwd_context.verify(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "username": user["username"],
            "phone": user["phone"],
            "address": user["address"],
            "avatar_url": user["avatar_url"],
        }
    }


@app.get("/api/profile")
async def get_profile(user_id: int = Depends(get_current_user)):
    db = get_db()
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    db.close()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "phone": user["phone"],
        "address": user["address"],
        "avatar_url": user["avatar_url"],
        "created_at": user["created_at"],
    }


@app.put("/api/profile")
async def update_profile(req: ProfileUpdate, user_id: int = Depends(get_current_user)):
    db = get_db()
    updates = []
    values = []
    if req.username is not None:
        updates.append("username = ?")
        values.append(req.username)
    if req.phone is not None:
        updates.append("phone = ?")
        values.append(req.phone)
    if req.address is not None:
        updates.append("address = ?")
        values.append(req.address)
    if req.avatar_url is not None:
        updates.append("avatar_url = ?")
        values.append(req.avatar_url)
    if updates:
        values.append(user_id)
        db.execute(f"UPDATE users SET {', '.join(updates)} WHERE id = ?", values)
        db.commit()
    user = db.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    db.close()
    return {
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "phone": user["phone"],
        "address": user["address"],
        "avatar_url": user["avatar_url"],
    }


@app.get("/api/products")
async def get_products():
    db = get_db()
    products = db.execute("SELECT * FROM products").fetchall()
    db.close()
    return [
        {
            "id": p["id"],
            "title": p["title"],
            "artist": p["artist"],
            "year": p["year"],
            "price": p["price"],
            "description": p["description"],
            "image_url": p["image_url"],
            "tracklist": json.loads(p["tracklist"]) if p["tracklist"] else [],
            "genre": p["genre"],
            "format": p["format"],
        }
        for p in products
    ]


@app.get("/api/products/{product_id}")
async def get_product(product_id: int):
    db = get_db()
    p = db.execute("SELECT * FROM products WHERE id = ?", (product_id,)).fetchone()
    db.close()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return {
        "id": p["id"],
        "title": p["title"],
        "artist": p["artist"],
        "year": p["year"],
        "price": p["price"],
        "description": p["description"],
        "image_url": p["image_url"],
        "tracklist": json.loads(p["tracklist"]) if p["tracklist"] else [],
        "genre": p["genre"],
        "format": p["format"],
    }


@app.get("/api/cart")
async def get_cart(user_id: int = Depends(get_current_user)):
    db = get_db()
    items = db.execute("""
        SELECT ci.id, ci.quantity, p.id as product_id, p.title, p.artist, p.price, p.image_url, p.year
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
    """, (user_id,)).fetchall()
    db.close()
    return [
        {
            "id": item["id"],
            "product_id": item["product_id"],
            "title": item["title"],
            "artist": item["artist"],
            "price": item["price"],
            "image_url": item["image_url"],
            "year": item["year"],
            "quantity": item["quantity"],
        }
        for item in items
    ]


@app.post("/api/cart")
async def add_to_cart(req: CartItemRequest, user_id: int = Depends(get_current_user)):
    db = get_db()
    existing = db.execute(
        "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?",
        (user_id, req.product_id)
    ).fetchone()
    if existing:
        db.execute(
            "UPDATE cart_items SET quantity = quantity + ? WHERE id = ?",
            (req.quantity, existing["id"])
        )
    else:
        db.execute(
            "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)",
            (user_id, req.product_id, req.quantity)
        )
    db.commit()
    db.close()
    return {"status": "ok"}


@app.put("/api/cart/{item_id}")
async def update_cart_item(item_id: int, req: CartItemRequest, user_id: int = Depends(get_current_user)):
    db = get_db()
    if req.quantity <= 0:
        db.execute("DELETE FROM cart_items WHERE id = ? AND user_id = ?", (item_id, user_id))
    else:
        db.execute("UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?", (req.quantity, item_id, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}


@app.delete("/api/cart/{item_id}")
async def remove_from_cart(item_id: int, user_id: int = Depends(get_current_user)):
    db = get_db()
    db.execute("DELETE FROM cart_items WHERE id = ? AND user_id = ?", (item_id, user_id))
    db.commit()
    db.close()
    return {"status": "ok"}


@app.post("/api/checkout")
async def checkout(req: CheckoutRequest, user_id: int = Depends(get_current_user)):
    db = get_db()
    items = db.execute("""
        SELECT ci.quantity, p.id as product_id, p.title, p.price
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
    """, (user_id,)).fetchall()
    if not items:
        db.close()
        raise HTTPException(status_code=400, detail="Cart is empty")
    total = sum(item["price"] * item["quantity"] for item in items)
    items_json = json.dumps([
        {"product_id": item["product_id"], "title": item["title"], "price": item["price"], "quantity": item["quantity"]}
        for item in items
    ])
    db.execute(
        "INSERT INTO orders (user_id, total, items, status) VALUES (?, ?, ?, 'completed')",
        (user_id, total, items_json)
    )
    db.execute("DELETE FROM cart_items WHERE user_id = ?", (user_id,))
    db.commit()
    db.close()
    return {"status": "ok", "total": total, "message": "Order placed successfully!"}


@app.get("/api/orders")
async def get_orders(user_id: int = Depends(get_current_user)):
    db = get_db()
    orders = db.execute(
        "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
    ).fetchall()
    db.close()
    return [
        {
            "id": order["id"],
            "total": order["total"],
            "status": order["status"],
            "items": json.loads(order["items"]),
            "created_at": order["created_at"],
        }
        for order in orders
    ]
