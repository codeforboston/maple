import firebase_admin
from firebase_admin import firestore

# Application Default credentials are automatically created.
app = firebase_admin.initialize_app()
db = firestore.client()

bills_ref = db.collection("generalCourts/194/bills")
bills = bills_ref.get()
count = 0
for bill in bills:
    document = bill.to_dict()
    if document.get("summary") is None or document.get("topics") is None:
        # Notes: DocumentText _can_ be None
        print(document.get("content", {}).get("DocumentText"))
        print(document.get("content", {}).get("Title"))
        print(document.get("content", {}).get("BillNumber"))
        exit()
