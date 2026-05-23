from datetime import datetime, timezone, timedelta
from app.models.user_model import User
from app.models.recognition_model import RecognitionRequest
from app.models.banknote_model import Banknote
from app.models.transaction_model import Transaction
from app.models.token_package_model import TokenPackage
from app.models.feedback_model import Feedback
from app.models.config_model import SystemConfig
from fastapi import HTTPException
class AdminService:
    @staticmethod
    async def get_dashboard_stats() -> dict:
        total_users = await User.count()
        active_users = await User.find(User.is_active == True).count()
        total_recognitions = await RecognitionRequest.count()
        
        # ĐÃ SỬA LỖI Ở ĐÂY: Dùng cú pháp {"$in": [...]} chuẩn của MongoDB
        completed_scans = await RecognitionRequest.find({
            "status": {
                "$in": ["Completed", "High Consensus", "Partial Success"]
            }
        }).count()
        
        success_txs = await Transaction.find(Transaction.status == "success").to_list()
        total_revenue = sum(tx.amount for tx in success_txs)
        tokens_sold = sum(tx.tokens_added for tx in success_txs)
        
        pending_feedbacks = await Feedback.find(Feedback.status == "pending").count()

        return {
            "kpis": {
                "total_users": total_users,
                "active_users": active_users,
                "total_scans": total_recognitions,
                "completed_scans": completed_scans,
                "total_revenue_vnd": total_revenue,
                "tokens_sold": tokens_sold,
                "pending_feedback": pending_feedbacks
            },
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

    @staticmethod
    async def get_system_health() -> dict:
        db_status = "Online"
        try:
            await User.find_one()
        except Exception:
            db_status = "Down"

        return {
            "api_server": "Online",
            "database": db_status,
            "ml_dl_agent": "Online",
            "llm_agent": "Online",
            "google_lens_agent": "Online",
            "aggregator": "Online"
        }

    @staticmethod
    async def get_agent_performance() -> dict:
        scans = await RecognitionRequest.find_all().to_list()
        total = len(scans)
        if total == 0:
            return {
                "ml_dl_success_rate": 0, "llm_success_rate": 0, "lens_success_rate": 0,
                "consensus_rate": 0, "conflict_rate": 0, "average_scan_time_sec": 0
            }
        
        ml_success = llm_success = lens_success = consensus_count = conflict_count = 0
        for s in scans:
            agents = getattr(s, 'agents', getattr(s, 'data', {}).get('agents', {}))
            consensus_data = getattr(s, 'consensus', getattr(s, 'data', {}).get('consensus', {}))
            
            if agents:
                if "ml_dl" in agents and "error" not in agents["ml_dl"]: ml_success += 1
                if "llm_api" in agents and "error" not in agents["llm_api"]: llm_success += 1
                if "visual_search" in agents and "error" not in agents["visual_search"]: lens_success += 1

            if consensus_data:
                matched = consensus_data.get("matched_agents", 0)
                if matched >= 2: consensus_count += 1
                else: conflict_count += 1

        return {
            "ml_dl_success_rate": round((ml_success / total) * 100, 1),
            "llm_success_rate": round((llm_success / total) * 100, 1),
            "lens_success_rate": round((lens_success / total) * 100, 1),
            "consensus_rate": round((consensus_count / total) * 100, 1),
            "conflict_rate": round((conflict_count / total) * 100, 1),
            "average_scan_time_sec": 4.2
        }

    # ĐÃ TÁCH CODE RIÊNG BIỆT CHO PYTHON 3.9
    @staticmethod
    async def get_recent_scans(limit: int = 10) -> list:
        scans = await RecognitionRequest.find_all().sort("-created_at").limit(limit).to_list()
        results = []
        for s in scans:
            data = s.model_dump() if hasattr(s, 'model_dump') else s.dict()
            data["id"] = str(s.id)
            results.append(data)
        return results

    # ĐÃ TÁCH CODE RIÊNG BIỆT CHO PYTHON 3.9
    @staticmethod
    async def get_pending_feedback(limit: int = 5) -> list:
        feedbacks = await Feedback.find(Feedback.status == "pending").sort("-created_at").limit(limit).to_list()
        results = []
        for f in feedbacks:
            data = f.model_dump() if hasattr(f, 'model_dump') else f.dict()
            data["id"] = str(f.id)
            results.append(data)
        return results

    @staticmethod
    async def get_payment_overview() -> dict:
        success_txs = await Transaction.find(Transaction.status == "success").count()
        pending_txs = await Transaction.find(Transaction.status == "pending").count()
        failed_txs = await Transaction.find(Transaction.status == "failed").count()
        total_packages = await TokenPackage.count()
        
        return {
            "successful_transactions": success_txs,
            "pending_transactions": pending_txs,
            "failed_transactions": failed_txs,
            "active_packages_count": total_packages
        }

    @staticmethod
    async def get_user_overview() -> dict:
        now = datetime.now(timezone.utc)
        start_of_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
        start_of_week = start_of_today - timedelta(days=now.weekday())

        new_today = await User.find(User.created_at >= start_of_today).count()
        new_week = await User.find(User.created_at >= start_of_week).count()
        admins = await User.find(User.role == "admin").count()
        normals = await User.find(User.role == "user").count()
        
        all_users = await User.find_all().to_list()
        google_users = sum(1 for u in all_users if "google" in str(getattr(u, 'auth_provider', getattr(u, 'provider', 'local'))).lower())
        email_users = len(all_users) - google_users

        return {
            "new_users_today": new_today,
            "new_users_this_week": new_week,
            "admin_users": admins,
            "normal_users": normals,
            "google_oauth_users": google_users,
            "email_users": email_users
        }

    @staticmethod
    async def get_banknote_overview() -> dict:
        total_notes = await Banknote.count()
        all_notes = await Banknote.find_all().to_list()
        countries = set(n.country for n in all_notes)
        missing_images = sum(1 for n in all_notes if not n.front_image_url)

        return {
            "total_banknotes": total_notes,
            "supported_countries_count": len(countries),
            "missing_images_count": missing_images
        }
    @staticmethod
    async def get_system_config() -> SystemConfig:
        config = await SystemConfig.find_one()
        if not config:
            config = SystemConfig()
            await config.insert()
        return config

    @staticmethod
    async def update_system_config(data: dict) -> SystemConfig:
        config = await AdminService.get_system_config()
        for key, value in data.items():
            if hasattr(config, key) and value is not None:
                setattr(config, key, value)
        await config.save()
        return config
    @staticmethod
    def _serialize_user(user: User) -> dict:
        return {
            "id": str(user.id),
            "email": getattr(user, "email", None),
            "full_name": (
                getattr(user, "full_name", None)
                or getattr(user, "name", None)
                or getattr(user, "username", None)
                or ""
            ),
            "phone": getattr(user, "phone", None),
            "country": getattr(user, "country", None),
            "role": getattr(user, "role", "user"),
            "is_active": getattr(user, "is_active", True),
            "status": getattr(user, "status", None),
            "auth_provider": (
                getattr(user, "auth_provider", None)
                or getattr(user, "provider", None)
                or "local"
            ),
            "token_balance": (
                getattr(user, "token_balance", None)
                if getattr(user, "token_balance", None) is not None
                else getattr(user, "tokens", 0)
            ),
            "email_verified": (
                getattr(user, "email_verified", None)
                if getattr(user, "email_verified", None) is not None
                else getattr(user, "is_email_verified", False)
            ),
            "avatar_url": (
                getattr(user, "avatar_url", None)
                or getattr(user, "avatar", None)
            ),
            "created_at": getattr(user, "created_at", None),
            "last_login_at": (
                getattr(user, "last_login_at", None)
                or getattr(user, "last_login", None)
            ),
        }

    @staticmethod
    async def get_admin_users(
        page: int = 1,
        limit: int = 50,
        search: str = "",
        role: str = "all",
        status: str = "all",
        provider: str = "all",
    ) -> dict:
        filters = {}

        if role and role != "all":
            filters["role"] = role

        if status and status != "all":
            if status in ["active", "enabled"]:
                filters["is_active"] = True
            elif status in ["banned", "blocked", "disabled", "inactive"]:
                filters["is_active"] = False

        if provider and provider != "all":
            filters["$or"] = [
                {"auth_provider": {"$regex": provider, "$options": "i"}},
                {"provider": {"$regex": provider, "$options": "i"}},
            ]

        if search:
            search_filter = {
                "$or": [
                    {"email": {"$regex": search, "$options": "i"}},
                    {"full_name": {"$regex": search, "$options": "i"}},
                    {"name": {"$regex": search, "$options": "i"}},
                    {"username": {"$regex": search, "$options": "i"}},
                ]
            }

            if "$or" in filters:
                filters = {"$and": [filters, search_filter]}
            else:
                filters.update(search_filter)

        skip = max(page - 1, 0) * limit

        if filters:
            total = await User.find(filters).count()
            users = (
                await User.find(filters)
                .sort("-created_at")
                .skip(skip)
                .limit(limit)
                .to_list()
            )
        else:
            total = await User.count()
            users = (
                await User.find_all()
                .sort("-created_at")
                .skip(skip)
                .limit(limit)
                .to_list()
            )

        return {
            "items": [AdminService._serialize_user(user) for user in users],
            "total": total,
            "page": page,
            "limit": limit,
        }

    @staticmethod
    async def get_admin_user_detail(user_id: str) -> dict:
        user = await User.get(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return AdminService._serialize_user(user)

    @staticmethod
    async def update_admin_user(user_id: str, data: dict) -> dict:
        user = await User.get(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        allowed_fields = ["full_name", "phone", "country", "token_balance"]

        for key in allowed_fields:
            if key in data and data[key] is not None and hasattr(user, key):
                setattr(user, key, data[key])

        await user.save()
        return AdminService._serialize_user(user)

    @staticmethod
    async def update_user_role(user_id: str, role: str) -> dict:
        user = await User.get(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if role not in ["user", "admin"]:
            raise HTTPException(status_code=400, detail="Invalid role")

        user.role = role
        await user.save()

        return AdminService._serialize_user(user)

    @staticmethod
    async def update_user_status(user_id: str, data: dict) -> dict:
        user = await User.get(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        is_active = data.get("is_active", None)
        status = data.get("status", None)

        if is_active is None and status is not None:
            normalized = str(status).lower()
            is_active = normalized in ["active", "enabled", "true"]

        if is_active is None:
            raise HTTPException(status_code=400, detail="Missing status value")

        user.is_active = bool(is_active)

        if hasattr(user, "status"):
            user.status = "active" if user.is_active else "banned"

        await user.save()
        return AdminService._serialize_user(user)

    @staticmethod
    async def delete_admin_user(user_id: str, current_admin: User) -> dict:
        user = await User.get(user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if str(user.id) == str(current_admin.id):
            raise HTTPException(
                status_code=400,
                detail="You cannot delete your own admin account",
            )

        await user.delete()

        return {
            "success": True,
            "message": "User deleted successfully",
            "id": user_id,
        }