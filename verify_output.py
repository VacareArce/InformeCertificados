import json

with open('report_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Verifying Certificados:")
for m in range(1, 8):
    if str(m) in data["certificados"]["mensual"]:
        m_data = data["certificados"]["mensual"][str(m)]
        if m_data["count"] > 0 or m_data["valor"] > 0:
            print(f"ERROR: Found data for month {m} in certificados!")

for r in data["certificados"]["rechazos"]:
    doc_id = r.get("document_id", "")
    if doc_id.startswith("AC-"):
        num = int(doc_id.replace("AC-", ""))
        if num > 1751:
            print(f"ERROR: Found rechazo with doc_id {doc_id} but should be <= AC-1751")

print("Verifying Constancias:")
for m in range(1, 8):
    if str(m) in data["constancias"]["mensual"]:
        m_data = data["constancias"]["mensual"][str(m)]
        if m_data["count"] > 0 or m_data["valor"] > 0:
            print(f"ERROR: Found data for month {m} in constancias!")

print("Done verification.")
