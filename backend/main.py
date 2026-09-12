from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import resources

# create table on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudySelf API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(resources.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the StudyShelf API! Visit /docs for the API documentation."}
