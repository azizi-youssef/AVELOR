from decimal import Decimal
from app.models.category import Category
from app.models.product import Product, ProductVariant
from app.models.promotion import Promotion
from app.models.enums import GenderUniverse, DiscountType

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register_and_login(client):
    # Inscription
    reg_data = {
        "email": "testuser@avelor.ma",
        "password": "Password123!",
        "first_name": "Hamza",
        "last_name": "Tazi",
        "phone": "+212600112233"
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_data)
    assert res_reg.status_code == 201
    data = res_reg.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@avelor.ma"

    # Connexion
    login_data = {
        "email": "testuser@avelor.ma",
        "password": "Password123!"
    }
    res_log = client.post("/api/v1/auth/login", json=login_data)
    assert res_log.status_code == 200
    assert "access_token" in res_log.json()

def test_products_and_order_flow(client, db):
    # Créer catégorie
    cat = Category(
        slug="costumes-homme",
        name_fr="Costumes Homme",
        name_ar="بدلات رجالية",
        universe=GenderUniverse.MEN
    )
    db.add(cat)
    db.flush()

    # Créer produit
    prod = Product(
        sku="AV-TEST-01",
        slug="costume-test-laine",
        name_fr="Costume Test",
        name_ar="بدلة تجريبية",
        base_price=Decimal("1500.00"),
        discount_price=None,
        universe=GenderUniverse.MEN,
        category_id=cat.id,
        is_active=True
    )
    db.add(prod)
    db.flush()

    # Créer variante avec stock initial 5
    variant = ProductVariant(
        product_id=prod.id,
        sku="AV-TEST-01-50-BLK",
        size="50",
        color_name_fr="Noir",
        color_name_ar="أسود",
        color_code="#000000",
        stock=5,
        is_active=True
    )
    db.add(variant)

    # Créer un code promo
    promo = Promotion(
        code="PROMO10",
        name_fr="10% Remise",
        name_ar="خصم 10%",
        discount_type=DiscountType.PERCENTAGE,
        discount_value=Decimal("10.00"),
        min_order_amount=Decimal("500.00"),
        is_active=True
    )
    db.add(promo)
    db.commit()

    # 1. Vérifier la liste des produits filtrée par univers MEN
    res_products = client.get("/api/v1/products?universe=MEN")
    assert res_products.status_code == 200
    items = res_products.json()["items"]
    assert len(items) >= 1
    assert items[0]["sku"] == "AV-TEST-01"

    # 2. Valider le code promotionnel
    res_promo = client.post("/api/v1/promotions/validate", json={
        "code": "PROMO10",
        "subtotal": 1500.0
    })
    assert res_promo.status_code == 200
    promo_data = res_promo.json()
    assert promo_data["is_valid"] is True
    # 10% de 1500 = 150
    assert float(promo_data["calculated_discount"]) == 150.0

    # 3. Passer une commande en Cash on Delivery (COD)
    order_payload = {
        "customer_name": "Mehdi Alami",
        "customer_phone": "+212677889900",
        "customer_email": "mehdi@example.com",
        "shipping_address": "12 Rue des Hespérides",
        "shipping_city": "Rabat",
        "shipping_postal_code": "10000",
        "delivery_notes": "Sonner à l'interphone 3B",
        "payment_method": "CASH_ON_DELIVERY",
        "coupon_code": "PROMO10",
        "items": [
            {
                "variant_id": variant.id,
                "quantity": 2
            }
        ]
    }
    res_order = client.post("/api/v1/orders", json=order_payload)
    assert res_order.status_code == 201
    order_data = res_order.json()
    
    assert order_data["order_number"].startswith("AV-")
    # Subtotal = 2 * 1500 = 3000
    assert float(order_data["subtotal"]) == 3000.0
    # Discount = 10% de 3000 = 300
    assert float(order_data["discount_amount"]) == 300.0
    # 3000 - 300 = 2700 >= 500 MAD (seuil livraison gratuite) donc frais de port = 0
    assert float(order_data["shipping_fee"]) == 0.0
    assert float(order_data["total_amount"]) == 2700.0
    assert order_data["status"] == "PENDING"
    assert order_data["payment_method"] == "CASH_ON_DELIVERY"

    # 4. Vérifier que le stock a bien été décrémenté de 2 (5 - 2 = 3)
    db.refresh(variant)
    assert variant.stock == 3
