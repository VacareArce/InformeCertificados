import csv
import json
import re
from datetime import datetime

csv_cert_path = r'c:\xampp\htdocs\InformeCertificados\BDCertificados.csv'

meses = {
    'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
    'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
    'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
}

def parse_fecha(fecha_str):
    if not fecha_str or str(fecha_str).strip() == '': 
        return datetime(2025, 12, 31)
        
    parts = str(fecha_str).replace(' de ', ' ').replace(' Del ', ' ').replace(' del ', ' ').split()
    if len(parts) >= 3:
        try:
            day = int(parts[0])
            month_str = parts[1].lower()
            year = int(parts[2])
            month = meses.get(month_str, 1)
            return datetime(year, month, day)
        except Exception:
            return datetime(2025, 12, 31)
            
    return datetime(2025, 12, 31)

def is_valid_doc_id(doc_id):
    if not doc_id: return True
    match = re.search(r'AC-(\d+)', doc_id, re.IGNORECASE)
    if match:
        num = int(match.group(1))
        if num > 1751:
            return False
    return True

missing = []

with open(csv_cert_path, 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f, delimiter=';')
    for row in reader:
        doc_id = row.get('document_id', '')
        mes_str = row.get('Mes', '').strip().lower()
        anio_str = row.get('Año', '').strip()
        
        mes_num = meses.get(mes_str)
        is_in_date_range_old_logic = anio_str == '2025' and mes_num and mes_num >= 8 and mes_num <= 12
        is_valid_id = is_valid_doc_id(doc_id)
        
        should_be_included = is_in_date_range_old_logic and is_valid_id
        
        fecha_str = row.get('Fecha Expedición', '').strip()
        fecha_date = parse_fecha(fecha_str)
        is_actually_included = fecha_date and fecha_date >= datetime(2025, 8, 1) and is_valid_id
        
        if should_be_included and not is_actually_included:
            missing.append({
                'doc_id': doc_id,
                'Empresa': row.get('Empresa'),
                'Fecha Expedición': fecha_str,
                'Mes': mes_str,
                'Año': anio_str,
                'Parsed Date': str(fecha_date) if fecha_date else 'FAILED'
            })

with open('missing_certificados.json', 'w', encoding='utf-8') as out:
    json.dump(missing, out, indent=2, ensure_ascii=False)
    
print(f"Saved {len(missing)} missing items.")
