import random
import psycopg2
from uuid import uuid4
import json

# Configuration
DB_URL = "host=localhost dbname=s2p user=postgres password=postgres_pass_2026"

SECTORS = [
    "Tekstil & Hazır Giyim", "Otomotiv Yan Sanayi", "Gıda İşleme & Paketleme", 
    "Yazılım & Bilişim", "Lojistik & Depolama", "Kimya & Plastik", 
    "İnşaat Malzemeleri", "Elektronik & Elektrik"
]

CITIES = [
    {"city": "Istanbul", "lat_range": (40.8, 41.2), "lng_range": (28.5, 29.5)},
    {"city": "Bursa", "lat_range": (40.1, 40.3), "lng_range": (28.9, 29.2)},
    {"city": "Kocaeli", "lat_range": (40.7, 40.8), "lng_range": (29.8, 30.0)},
    {"city": "Sakarya", "lat_range": (40.6, 40.8), "lng_range": (30.3, 30.5)},
    {"city": "Tekirdag", "lat_range": (40.9, 41.0), "lng_range": (27.4, 27.6)}
]

SOURCES = ["google_maps", "linkedin", "apollo", "manual_entry", "trade_show_2025"]

NAME_PREFIXES = ["Global", "Ege", "Marmara", "Öz", "Lider", "Seçkin", "Tekno", "Mega", "Alfa", "Vizyon"]
NAME_MID = ["Lojistik", "Tekstil", "Metal", "Gıda", "Yazılım", "Plastik", "Kimya", "İnşaat"]
NAME_SUFFIXES = ["A.Ş.", "Ltd. Şti.", "Grubu", "Sanayi Ticaret", "Teknoloji", "Sistemleri"]

def generate_supplier_name():
    return f"{random.choice(NAME_PREFIXES)} {random.choice(NAME_MID)} {random.choice(NAME_SUFFIXES)}"

def generate_mock_data(count=1500):
    conn = psycopg2.connect(DB_URL)
    cur = conn.cursor()
    
    print(f"🚀 {count} adet Marmara bölgesi tedarikçi verisi üretiliyor...")
    
    for i in range(count):
        sector = random.choice(SECTORS)
        city_info = random.choice(CITIES)
        source = random.choice(SOURCES)
        name = generate_supplier_name()
        
        lat = random.uniform(*city_info['lat_range'])
        lng = random.uniform(*city_info['lng_range'])
        
        score = random.randint(40, 95)
        
        cur.execute("""
            INSERT INTO suppliers (
                name, sector, city, country, latitude, longitude, 
                ai_score, status, source, address, phone, website_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
        """, (
            name, sector, city_info['city'], "Turkey", lat, lng,
            score, 'discovered', source, 
            f"{city_info['city']} Organize Sanayi Bölgesi No: {random.randint(1,500)}",
            f"+90 212 {random.randint(100,999)} {random.randint(10,99)} {random.randint(10,99)}",
            f"https://www.{name.lower().replace(' ', '').replace('.', '').replace('ş', 's').replace('ç', 'c')}.com.tr"
        ))
        
        if i % 300 == 0 and i > 0:
            print(f"✅ {i} kayıt tamamlandı...")

    conn.commit()
    cur.close()
    conn.close()
    print(f"✨ Toplam {count} kayıt başarıyla eklendi.")

if __name__ == "__main__":
    generate_mock_data(1500)
