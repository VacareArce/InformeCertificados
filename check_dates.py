import csv
import json

csv_cert_path = r'c:\xampp\htdocs\InformeCertificados\BDCertificados.csv'
csv_const_path = r'c:\xampp\htdocs\InformeCertificados\Constancias de donacion 2024V2.1 - Constancias de donacion 2024.csv'

def check_dates():
    dates = []
    ids = []
    try:
        with open(csv_cert_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=';')
            for i, row in enumerate(reader):
                if i < 20: 
                    dates.append(row.get('Fecha Expedición', ''))
                    ids.append(row.get('document_id', ''))
                    
        with open(csv_const_path, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f, delimiter=',')
            for i, row in enumerate(reader):
                clean_row = {k.strip(): v for k, v in row.items() if k}
                if i < 5:
                    dates.append(clean_row.get('Fecha de Expedición', ''))
                    ids.append(clean_row.get('Consecutivo', ''))
                    
        with open('debug_out.json', 'w') as out:
            json.dump({'dates': dates, 'ids': ids}, out, indent=2)
            
    except Exception as e:
        print(e)
check_dates()
