import enum

class GenderUniverse(str, enum.Enum):
    MEN = "MEN"
    WOMEN = "WOMEN"
    UNISEX = "UNISEX"

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    CATALOG_MANAGER = "CATALOG_MANAGER"
    ORDER_MANAGER = "ORDER_MANAGER"
    CUSTOMER = "CUSTOMER"

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"               # En attente de confirmation
    CONFIRMED = "CONFIRMED"           # Confirmée
    PROCESSING = "PROCESSING"         # En préparation
    SHIPPED = "SHIPPED"               # Expédiée
    DELIVERED = "DELIVERED"           # Livrée
    CANCELLED = "CANCELLED"           # Annulée
    RETURNED = "RETURNED"             # Retournée

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class PaymentMethod(str, enum.Enum):
    CASH_ON_DELIVERY = "CASH_ON_DELIVERY"
    ONLINE_CARD = "ONLINE_CARD"

class DiscountType(str, enum.Enum):
    PERCENTAGE = "PERCENTAGE"
    FIXED = "FIXED"

class InventoryReason(str, enum.Enum):
    SALE = "SALE"
    RESTOCK = "RESTOCK"
    RETURN = "RETURN"
    ADJUSTMENT = "ADJUSTMENT"
