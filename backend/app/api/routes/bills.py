"""Bill upload and OCR routes."""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import process_bill_image, validate_file
from app.services.electricity_service import add_reading
from app.schemas import BillConfirmRequest
import uuid

router = APIRouter(prefix="/api/bills", tags=["bills"])

DEMO_USER_ID = "demo-user-001"


@router.post("/upload")
async def upload_bill(file: UploadFile = File(...)):
    """Upload and process an electricity bill using OCR."""
    # Read file
    content = await file.read()

    # Validate
    is_valid, msg = validate_file(file.filename or "", file.content_type or "", len(content))
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    # Process with OCR
    result = await process_bill_image(content, file.filename or "", file.content_type or "")
    return result


@router.post("/confirm")
async def confirm_bill(data: BillConfirmRequest):
    """Confirm and save extracted/manual bill data."""
    result = add_reading(
        user_id=DEMO_USER_ID,
        month=data.month,
        year=data.year,
        units_kwh=data.units_consumed,
        bill_amount=data.bill_amount,
        source="bill_upload"
    )
    return {"success": True, "reading": result, "message": "Bill data saved successfully."}
