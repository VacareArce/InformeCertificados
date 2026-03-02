import json

json_path = r'c:\xampp\htdocs\InformeCertificados\report_data.json'

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

total_count_cert = 0
for m, d in data["certificados"]["mensual"].items():
    total_count_cert += d["count"]

total_rechazos_cert = len(data["certificados"]["rechazos"])

print(f"Total Certificados VÁLIDOS (agosto-dic, <= AC-1751): {total_count_cert}")
print(f"Total Certificados RECHAZADOS: {total_rechazos_cert}")
print(f"Total General: {total_count_cert + total_rechazos_cert}")
