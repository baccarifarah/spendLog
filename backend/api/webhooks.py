from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
import logging

router = APIRouter(
    prefix="/webhooks",
    tags=["webhooks"]
)

logger = logging.getLogger(__name__)

@router.post("/auth")
async def handle_auth_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Supabase auth webhooks (USER_CREATED)
    """
    try:
        payload = await request.json()
        logger.info(f"Received webhook payload: {payload}")
        
        event_type = payload.get("type")
        record = payload.get("record")

        if event_type == "INSERT" and record:       
            user_id = record.get("id")
            email = record.get("email")
            raw_user_meta_data = record.get("raw_user_meta_data", {})
            full_name = raw_user_meta_data.get("full_name") or raw_user_meta_data.get("name")
            avatar_url = raw_user_meta_data.get("avatar_url")

            if not user_id or not email:
                logger.warning("Invalid webhook payload: missing id or email")
                # Return 200 to acknowledge receipt even if invalid to prevent retries if it's malformed
                return {"status": "ignored", "reason": "missing_data"}

            # Check if user exists
            existing_user = db.query(models.User).filter(models.User.id == user_id).first()
            if existing_user:
                logger.info(f"User {user_id} already exists")
                return {"status": "exists"}

            # Create user
            new_user = models.User(
                id=user_id,
                email=email,
                full_name=full_name,
                avatar_url=avatar_url
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            logger.info(f"Created user {user_id}")
            return {"status": "created", "user_id": user_id}
            
        else:
             if "id" in payload and "email" in payload:
                 user_id = payload.get("id")
                 email = payload.get("email")
                 raw_user_meta_data = payload.get("raw_user_meta_data", {})
                 full_name = raw_user_meta_data.get("full_name")
                 avatar_url = raw_user_meta_data.get("avatar_url")
                 
                 existing_user = db.query(models.User).filter(models.User.id == user_id).first()
                 if existing_user:
                    return {"status": "exists"}
                 
                 new_user = models.User(
                    id=user_id,
                    email=email,
                    full_name=full_name,
                    avatar_url=avatar_url
                 )
                 db.add(new_user)
                 db.commit()
                 return {"status": "created"}

        return {"status": "ignored", "reason": "unknown_event"}

    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
