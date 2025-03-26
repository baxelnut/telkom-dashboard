import re
import os
import pandas as pd
import numpy as np
from supabase import create_client
from dotenv import load_dotenv
from tqdm import tqdm

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def clean_numeric_columns(df):
    """🔥 Removes commas from numeric columns to prevent Supabase errors."""
    for col in df.columns:
        if df[col].dtype == "object":
            df[col] = df[col].str.replace(",", "", regex=True)  
    return df

def fix_dates(df):
    """🚀 Convert wrong date formats into 'YYYY-MM-DD'."""
    date_columns = [
        "li_billdate", "billcom_date", "li_status_date", 
        "li_billing_start_date", "order_created_date", 
        "agree_start_date", "agree_end_date"
    ]
    
    for col in date_columns:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: fix_date_string(x) if isinstance(x, str) else x)

    return df

def fix_date_string(date_str):
    """🔥 Convert various date formats into 'YYYY-MM-DD' or NULL for Supabase."""
    if pd.isna(date_str) or str(date_str).strip().lower() in ["nan", "none", ""]:
        return None  # Convert empty values to NULL

    date_str = str(date_str).strip().replace(",", "")  

    # Match YYYY-MM-DD
    match = re.match(r"(\d{4}-\d{2}-\d{2})", date_str)
    if match:
        return match.group(1)

    # Match YYYYMM (e.g., 202112 -> 2021-12-01)
    match = re.match(r"(\d{4})(\d{2})$", date_str)
    if match:
        return f"{match.group(1)}-{match.group(2)}-01"

    print(f"🚨 Unrecognized date format: {date_str}") 
    return None 

def clean_dataframe(df):
    """🔥 Apply column name cleaning, date fixing, and handle NULL/NaN values correctly."""
    # 🛠 Force lowercase & remove spaces from column names
    df.columns = df.columns.str.lower().str.strip().str.replace(" ", "_")
    print("🧐 Cleaned Column Names:", df.columns.tolist())

    for col in df.columns:
        if "date" in col.lower():  
            df[col] = df[col].apply(fix_date_string)
    
    return df.replace({np.nan: None})  

def upload_csv_to_supabase(csv_path, table_name, chunk_size=1000):
    """Uploads a CSV file to Supabase in chunks."""
    # Read everything as string
    df_iter = pd.read_csv(csv_path, chunksize=chunk_size, dtype=str)  
    total_uploaded = 0

    print(f"📂 Uploading {csv_path} to {table_name} in {chunk_size}-row chunks...")

    for chunk in tqdm(df_iter, desc="Uploading to Supabase"):
        chunk.columns = chunk.columns.str.lower().str.strip().str.replace(" ", "_")  # 🔥 Clean column names
        chunk = chunk.replace({np.nan: None})  
        chunk = clean_numeric_columns(chunk)  
        chunk = fix_dates(chunk) 

        # Force REAL None values before inserting (instead of "None" strings)
        chunk = chunk.applymap(lambda x: None if x in ["None", "nan", ""] else x)

        # Insert data into Supabase
        response = supabase.table(table_name).insert(chunk.to_dict(orient="records")).execute()
        print("🔍 Insert Response:", response)

        if isinstance(response, dict) and "error" in response:
            print(f"🚨 Upload failed: {response['error']}")
            break  
        
        total_uploaded += len(chunk)

    print(f"✅ Upload complete! {total_uploaded} rows uploaded.")


# UPLOAD
if __name__ == "__main__":
    csv_file_path = "../public/data/data.csv"  
    supabase_table = "aosodomoro"  
    upload_csv_to_supabase(csv_file_path, supabase_table)
