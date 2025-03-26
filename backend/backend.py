from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder  
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
import pandas as pd
import numpy as np
import os

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
EXCEL_PATH = os.path.join(BASE_DIR, "../public/data/dummy.xlsx")

try:
    df = pd.read_excel(EXCEL_PATH, engine="openpyxl")
except Exception as e:
    print(f"🚨 Excel file error: {e}")
    df = None  

@app.get("/data")
def get_data():
    try:
        if df is None:
            return JSONResponse(content={"error": "Excel file could not be read"}, status_code=500)
        
        print("\n📊 DataFrame Column Types BEFORE:")
        print(df.dtypes)

        datetime_cols = [
            "LI_BILLDATE", "LI_STATUS_DATE", "LI_BILLING_START_DATE", "ORDER_CREATED_DATE",
            "AGREE_START_DATE", "AGREE_END_DATE", "LI_CREATED_DATE", "PRODUCT_ACTIVATION_DATE", "X_BILLCOMP_DT"
        ]

        for col in datetime_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors="coerce")  

        clean_df = df.copy()

        for col in datetime_cols:
            if col in clean_df.columns:
                clean_df[col] = clean_df[col].dt.strftime("%Y-%m-%d").astype(str)
        
        clean_df = clean_df.replace({np.nan: None})
        
        print("\n📊 DataFrame Column Types AFTER:")
        print(clean_df.dtypes)
        
        return JSONResponse(content=jsonable_encoder({"data": clean_df.to_dict(orient="records")}), status_code=200)

    except Exception as e:
        print(f"🔥 API Error: {e}")  
        return JSONResponse(content={"error": "Internal Server Error", "detail": str(e)}, status_code=500)