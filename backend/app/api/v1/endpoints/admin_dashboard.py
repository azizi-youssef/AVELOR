"""
Endpoint administration — Tableau de bord & statistiques.
"""
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from app.core.database import get_db
from app.api.deps import get_admin_user
from app.models.user import User
from app.models.product import Product, ProductVariant
from app.models.order import Order, OrderItem
from app.models.enums import OrderStatus, GenderUniverse, UserRole

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
#  TABLEAU DE BORD
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_admin_user)
):
    total_orders = db.query(Order).count()

    revenue_query = db.query(func.sum(Order.total_amount)).filter(
        Order.status != OrderStatus.CANCELLED
    ).scalar()
    total_revenue = Decimal(str(revenue_query)) if revenue_query else Decimal("0.00")

    valid_orders_count = db.query(Order).filter(Order.status != OrderStatus.CANCELLED).count()
    average_cart_value = (
        (total_revenue / Decimal(str(valid_orders_count))).quantize(Decimal("0.01"))
        if valid_orders_count > 0
        else Decimal("0.00")
    )

    pending_orders = db.query(Order).filter(
        Order.status.in_([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING])
    ).count()

    low_stock_variants = db.query(ProductVariant).options(
        joinedload(ProductVariant.product)
    ).filter(
        ProductVariant.is_active == True,
        ProductVariant.stock < 5,
        ProductVariant.stock > 0
    ).limit(10).all()

    out_of_stock_count = db.query(ProductVariant).filter(
        ProductVariant.is_active == True,
        ProductVariant.stock == 0
    ).count()

    total_low_stock_count = db.query(ProductVariant).filter(
        ProductVariant.is_active == True,
        ProductVariant.stock < 5
    ).count()

    status_counts = {}
    for st in OrderStatus:
        status_counts[st.value] = db.query(Order).filter(Order.status == st).count()

    men_revenue_query = db.query(func.sum(OrderItem.total_price)).join(
        Order, OrderItem.order_id == Order.id
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Order.status != OrderStatus.CANCELLED,
        Product.universe == GenderUniverse.MEN
    ).scalar()
    men_revenue = Decimal(str(men_revenue_query)) if men_revenue_query else Decimal("0.00")

    women_revenue_query = db.query(func.sum(OrderItem.total_price)).join(
        Order, OrderItem.order_id == Order.id
    ).join(
        Product, OrderItem.product_id == Product.id
    ).filter(
        Order.status != OrderStatus.CANCELLED,
        Product.universe == GenderUniverse.WOMEN
    ).scalar()
    women_revenue = Decimal(str(women_revenue_query)) if women_revenue_query else Decimal("0.00")

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    sales_timeline = []
    for i in range(6, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day_date, datetime.min.time())
        day_end = datetime.combine(day_date, datetime.max.time())

        day_rev = db.query(func.sum(Order.total_amount)).filter(
            Order.status != OrderStatus.CANCELLED,
            Order.created_at >= day_start,
            Order.created_at <= day_end
        ).scalar()
        day_orders = db.query(Order).filter(
            Order.created_at >= day_start,
            Order.created_at <= day_end
        ).count()
        sales_timeline.append({
            "date": day_date.strftime("%d/%m"),
            "full_date": day_date.isoformat(),
            "revenue": float(day_rev) if day_rev else 0.0,
            "orders": day_orders
        })

    total_customers = db.query(User).filter(User.role == UserRole.CUSTOMER).count()
    total_products = db.query(Product).filter(Product.is_active == True).count()

    recent_orders = db.query(Order).options(
        joinedload(Order.items)
    ).order_by(Order.created_at.desc()).limit(6).all()

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "average_cart_value": average_cart_value,
        "pending_orders": pending_orders,
        "low_stock_count": total_low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "total_customers": total_customers,
        "total_products": total_products,
        "status_counts": status_counts,
        "sales_timeline": sales_timeline,
        "universe_breakdown": {
            "men_revenue": men_revenue,
            "women_revenue": women_revenue,
        },
        "low_stock_items": [
            {
                "id": v.id,
                "product_name": v.product.name_fr,
                "sku": v.sku,
                "size": v.size,
                "color": v.color_name_fr,
                "stock": v.stock
            } for v in low_stock_variants
        ],
        "recent_orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "customer_city": o.shipping_city,
                "total_amount": o.total_amount,
                "status": o.status,
                "created_at": o.created_at
            } for o in recent_orders
        ]
    }
