from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User, Address
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductVariant, InventoryMovement
from app.models.campaign import Campaign
from app.models.promotion import Promotion
from app.models.enums import UserRole, GenderUniverse, DiscountType, InventoryReason

def seed_database():
    # Crée les tables si elles n'existent pas
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Utilisateurs
        admin = db.query(User).filter(User.email == settings.FIRST_SUPERUSER_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.FIRST_SUPERUSER_EMAIL,
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                first_name="Karim",
                last_name="El Fassi",
                phone="+212661000001",
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)

        client = db.query(User).filter(User.email == "client@avelor.ma").first()
        if not client:
            client = User(
                email="client@avelor.ma",
                hashed_password=get_password_hash("ClientAvelor2026!"),
                first_name="Yasmine",
                last_name="Bennani",
                phone="+212662000002",
                role=UserRole.CUSTOMER,
                is_active=True
            )
            db.add(client)
            db.flush()

            # Adresse par défaut pour le client
            addr = Address(
                user_id=client.id,
                full_name="Yasmine Bennani",
                phone="+212662000002",
                street_address="35 Boulevard d'Anfa, Résidence Les Palmiers, Étage 4",
                city="Casablanca",
                region="Casablanca-Settat",
                postal_code="20050",
                is_default=True
            )
            db.add(addr)

        # 2. Catégories
        categories_data = [
            # Homme
            {"slug": "homme-costumes", "name_fr": "Costumes & Blazers", "name_ar": "بدلات وسترات رسمية", "universe": GenderUniverse.MEN, "sort_order": 1},
            {"slug": "homme-chemises", "name_fr": "Chemises de Luxe", "name_ar": "قمصان فاخرة", "universe": GenderUniverse.MEN, "sort_order": 2},
            {"slug": "homme-chaussures", "name_fr": "Chaussures & Derbies", "name_ar": "أحذية وأكسفورد", "universe": GenderUniverse.MEN, "sort_order": 3},
            {"slug": "homme-accessoires", "name_fr": "Accessoires & Cuir", "name_ar": "إكسسوارات وجلود", "universe": GenderUniverse.MEN, "sort_order": 4},
            # Femme
            {"slug": "femme-robes", "name_fr": "Robes de Soirée", "name_ar": "فساتين سهرة راقية", "universe": GenderUniverse.WOMEN, "sort_order": 1},
            {"slug": "femme-blazers", "name_fr": "Tailleurs & Blazers", "name_ar": "سترات وبدلات نسائية", "universe": GenderUniverse.WOMEN, "sort_order": 2},
            {"slug": "femme-sacs", "name_fr": "Sacs à Main en Cuir", "name_ar": "حقائب يد جلدية", "universe": GenderUniverse.WOMEN, "sort_order": 3},
            {"slug": "femme-chaussures", "name_fr": "Escarpins & Talons", "name_ar": "أحذية كعب عالي", "universe": GenderUniverse.WOMEN, "sort_order": 4},
        ]

        cat_map = {}
        for cat_d in categories_data:
            existing_cat = db.query(Category).filter(Category.slug == cat_d["slug"]).first()
            if not existing_cat:
                cat = Category(**cat_d)
                db.add(cat)
                db.flush()
                cat_map[cat_d["slug"]] = cat
            else:
                cat_map[cat_d["slug"]] = existing_cat

        # 3. Produits réels haute couture
        products_data = [
            # 1. Homme - Costume Laine Royale
            {
                "sku": "AV-M-CST-01",
                "slug": "costume-croise-laine-italienne-noir",
                "name_fr": "Costume Croisé en Laine Royale Italienne",
                "name_ar": "بدلة رجالية بصدر مزدوج من الصوف الإيطالي الملكي",
                "short_desc_fr": "Coupe tailoring sartoriale d'une élégance absolue.",
                "short_desc_ar": "قصة خياطة سارتوريال راقية لإطلالة فائقة الأناقة.",
                "description_fr": "Confectionné dans un drap de laine 130s sélectionné parmi les plus prestigieuses filatures de Biella. Doublure soyeuse ton sur ton, boutons en corne véritable et finitions main soignées.",
                "description_ar": "مصنوعة من صوف 130s الفاخر من أرقى معامل الغزل الإيطالية. بطانة حريرية ناعمة، أزرار من القرن الطبيعي ولمسات خياطة يدوية متقنة.",
                "base_price": Decimal("2890.00"),
                "discount_price": Decimal("2490.00"),
                "universe": GenderUniverse.MEN,
                "cat_slug": "homme-costumes",
                "is_featured": True,
                "is_new": True,
                "images": [
                    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "48", "color_name_fr": "Noir Profond", "color_name_ar": "أسود داكن", "color_code": "#111111", "stock": 12},
                    {"size": "50", "color_name_fr": "Noir Profond", "color_name_ar": "أسود داكن", "color_code": "#111111", "stock": 15},
                    {"size": "52", "color_name_fr": "Noir Profond", "color_name_ar": "أسود داكن", "color_code": "#111111", "stock": 8},
                    {"size": "50", "color_name_fr": "Bleu Nuit", "color_name_ar": "أزرق ليلي", "color_code": "#0B192C", "stock": 10},
                ]
            },
            # 2. Homme - Chemise Popeline Égyptienne
            {
                "sku": "AV-M-CHM-01",
                "slug": "chemise-popeline-coton-egyptien-blanc",
                "name_fr": "Chemise Col Italien en Coton d'Égypte",
                "name_ar": "قميص ياقة إيطالية من قطن الجيزة المصري",
                "short_desc_fr": "Tissage haute densité ultra doux et infroissable.",
                "short_desc_ar": "نسيج عالي الكثافة فائق النعومة ومقاوم للتجعد.",
                "description_fr": "Un essentiel du vestiaire masculin contemporain. Coton à fibres extra-longues offrant une brillance satinée délicate et un confort thermique exceptionnel.",
                "description_ar": "قطعة أساسية للمظهر العصري الراقي. قطن طويل التيلة يمنح ملمساً ناعماً ولمعاناً خفيفاً وراحة استثنائية طوال اليوم.",
                "base_price": Decimal("890.00"),
                "discount_price": None,
                "universe": GenderUniverse.MEN,
                "cat_slug": "homme-chemises",
                "is_featured": True,
                "is_new": True,
                "images": [
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "39", "color_name_fr": "Blanc Pur", "color_name_ar": "أبيض ناصع", "color_code": "#FFFFFF", "stock": 25},
                    {"size": "40", "color_name_fr": "Blanc Pur", "color_name_ar": "أبيض ناصع", "color_code": "#FFFFFF", "stock": 20},
                    {"size": "41", "color_name_fr": "Blanc Pur", "color_name_ar": "أبيض ناصع", "color_code": "#FFFFFF", "stock": 18},
                    {"size": "40", "color_name_fr": "Bleu Ciel", "color_name_ar": "أزرق سماوي", "color_code": "#A0C4E2", "stock": 15},
                ]
            },
            # 3. Homme - Mocassins Cuir Patiné
            {
                "sku": "AV-M-CHS-01",
                "slug": "mocassins-cuir-veau-patine-marron",
                "name_fr": "Mocassins Péniche en Cuir Patiné à la Main",
                "name_ar": "حذاء لوفر من جلد العجل المعتّق يدوياً",
                "short_desc_fr": "Montage Goodyear et cuir pleine fleur d'excellence.",
                "short_desc_ar": "خياطة غوديير قوية مع جلد طبيعي معتق يدوياً بحرفية تامة.",
                "description_fr": "Fabriqués artisanalement avec une semelle en cuir rigide et cambrion renforcé. La patine apporte des reflets havane et tabac uniques à chaque paire.",
                "description_ar": "مصنوع يدوياً بنعل جلدي مريح ومقاوم. التعتيق اليدوي يمنح تدرجات لونية بنية وتبغية فريدة تزداد جمالاً مع الوقت.",
                "base_price": Decimal("1950.00"),
                "discount_price": Decimal("1690.00"),
                "universe": GenderUniverse.MEN,
                "cat_slug": "homme-chaussures",
                "is_featured": True,
                "is_new": False,
                "images": [
                    "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "41", "color_name_fr": "Havane Patiné", "color_name_ar": "بني تبغي", "color_code": "#5A3825", "stock": 6},
                    {"size": "42", "color_name_fr": "Havane Patiné", "color_name_ar": "بني تبغي", "color_code": "#5A3825", "stock": 9},
                    {"size": "43", "color_name_fr": "Havane Patiné", "color_name_ar": "بني تبغي", "color_code": "#5A3825", "stock": 7},
                    {"size": "42", "color_name_fr": "Noir Onyx", "color_name_ar": "أسود أونيكس", "color_code": "#1A1A1A", "stock": 8},
                ]
            },
            # 4. Homme - Sac de Voyage Week-end
            {
                "sku": "AV-M-ACC-01",
                "slug": "sac-weekend-cuir-marocain-prestige",
                "name_fr": "Sac Weekend 48H en Cuir Pleine Fleur",
                "name_ar": "حقيبة عطلة أسبوعية جلدية فاخرة 48 ساعة",
                "short_desc_fr": "Volume généreux, garnitures laiton brossé et finitions sellier.",
                "short_desc_ar": "سعة رحبة، أقفال من النحاس المصقول وتشطيبات جلدية ملكية.",
                "description_fr": "Le compagnon idéal de vos déplacements d'affaires et escapades. Doté d'un compartiment indépendant pour chaussures et d'une bandoulière matelassée amovible.",
                "description_ar": "الرفيق المثالي لرحلات العمل والرحلات السريعة. مزودة بمقصورة خاصة للأحذية وحزام كتف مبطن قابل للفصل.",
                "base_price": Decimal("2450.00"),
                "discount_price": None,
                "universe": GenderUniverse.MEN,
                "cat_slug": "homme-accessoires",
                "is_featured": False,
                "is_new": True,
                "images": [
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "TU", "color_name_fr": "Châtaigne", "color_name_ar": "كستنائي ملكي", "color_code": "#4A2E18", "stock": 14},
                    {"size": "TU", "color_name_fr": "Noir Mat", "color_name_ar": "أسود مطفي", "color_code": "#222222", "stock": 10},
                ]
            },
            # 5. Femme - Robe Longue en Satin de Soie
            {
                "sku": "AV-W-ROB-01",
                "slug": "robe-longue-satin-soie-emeraude",
                "name_fr": "Robe Sculpturale en Satin de Soie Vert Émeraude",
                "name_ar": "فستان سهرة طويل من حرير الساتان الأخضر الزمردي",
                "short_desc_fr": "Drapé fluide sublimant la silhouette avec dos échancré.",
                "short_desc_ar": "انسدال أنثوي راقٍ يبرز جمال القوام مع فتحة ظهر مميزة.",
                "description_fr": "Une création haute couture conçue pour marquer les grands événements. La pure soie mulberry capte la lumière avec une intensité sans pareille.",
                "description_ar": "تصميم كوتور فاخر خُصص للمناسبات الكبرى. حرير التوت الطبيعي يعكس الضوء ببريق ناعم وانسيابية ملكية ساحرة.",
                "base_price": Decimal("3200.00"),
                "discount_price": Decimal("2850.00"),
                "universe": GenderUniverse.WOMEN,
                "cat_slug": "femme-robes",
                "is_featured": True,
                "is_new": True,
                "images": [
                    "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "36", "color_name_fr": "Vert Émeraude", "color_name_ar": "أخضر زمردي", "color_code": "#097969", "stock": 7},
                    {"size": "38", "color_name_fr": "Vert Émeraude", "color_name_ar": "أخضر زمردي", "color_code": "#097969", "stock": 10},
                    {"size": "40", "color_name_fr": "Vert Émeraude", "color_name_ar": "أخضر زمردي", "color_code": "#097969", "stock": 5},
                    {"size": "38", "color_name_fr": "Champagne Doré", "color_name_ar": "شمبانيا ذهبي", "color_code": "#F7E7CE", "stock": 8},
                ]
            },
            # 6. Femme - Blazer Tailleur Crêpe Ivoire
            {
                "sku": "AV-W-BLZ-01",
                "slug": "blazer-tailleur-crepe-ivoire-boutons-dores",
                "name_fr": "Blazer Structuré en Crêpe Ivoire & Boutons Gravés",
                "name_ar": "سترة بليزر كريب عاجية بأزرار معدنية مذهبة",
                "short_desc_fr": "Épaules affirmées, taille cintrée et tombé impeccable.",
                "short_desc_ar": "أكتاف مصقولة، خصر محدد وخامة فاخرة تمنح ثقة ورونقاً استثنائياً.",
                "description_fr": "Le vestiaire intemporel de la femme de pouvoir. Doublé de satin léger, ce blazer se porte aussi bien en tailleur d'affaires qu'en tenue du soir décontractée.",
                "description_ar": "قطعة راقية للمرأة المتميزة. مبطن بساتين حريري مريح ومثالي لاجتماعات الأعمال الرفيعة والأمسيات الخاصة.",
                "base_price": Decimal("2100.00"),
                "discount_price": None,
                "universe": GenderUniverse.WOMEN,
                "cat_slug": "femme-blazers",
                "is_featured": True,
                "is_new": True,
                "images": [
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "36", "color_name_fr": "Ivoire Impérial", "color_name_ar": "عاجي ملكي", "color_code": "#FFFFF0", "stock": 11},
                    {"size": "38", "color_name_fr": "Ivoire Impérial", "color_name_ar": "عاجي ملكي", "color_code": "#FFFFF0", "stock": 14},
                    {"size": "40", "color_name_fr": "Ivoire Impérial", "color_name_ar": "عاجي ملكي", "color_code": "#FFFFF0", "stock": 9},
                    {"size": "38", "color_name_fr": "Noir Signature", "color_name_ar": "أسود سيغناتشر", "color_code": "#000000", "stock": 12},
                ]
            },
            # 7. Femme - Sac à Main Cuir Grainé
            {
                "sku": "AV-W-SAC-01",
                "slug": "sac-a-main-cuir-graine-fermoir-or",
                "name_fr": "Sac Trapèze en Cuir Grainé avec Fermoir Or 24K",
                "name_ar": "حقيبة ترابيز من الجلد المحبب بقفل مطلي بالذهب 24 قيراط",
                "short_desc_fr": "L'icône de la maroquinerie d'art AVELOR.",
                "short_desc_ar": "أيقونة الفخامة الجلدية الراقية من أفيولور.",
                "description_fr": "Assemblé avec patience selon la tradition des maîtres maroquiniers. Intérieur doublé en cuir suédé, compartiments protégés et pieds de protection dorés.",
                "description_ar": "صُنعت يدوياً على أيدي كبار صناع الجلود. بطانة داخلية من السويد الناعم مع تقسيمات ذكية وأرجل تثبيت مذهبة لحماية القاعدة.",
                "base_price": Decimal("3500.00"),
                "discount_price": Decimal("2990.00"),
                "universe": GenderUniverse.WOMEN,
                "cat_slug": "femme-sacs",
                "is_featured": True,
                "is_new": False,
                "images": [
                    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "TU", "color_name_fr": "Camel Chaud", "color_name_ar": "جملي دافئ", "color_code": "#C19A6B", "stock": 8},
                    {"size": "TU", "color_name_fr": "Noir Profond", "color_name_ar": "أسود نقي", "color_code": "#000000", "stock": 10},
                    {"size": "TU", "color_name_fr": "Bordeaux Majestueux", "color_name_ar": "بورغندي ملوكي", "color_code": "#800020", "stock": 6},
                ]
            },
            # 8. Femme - Escarpins Cuir Verni
            {
                "sku": "AV-W-ESC-01",
                "slug": "escarpins-cuir-verni-talon-stiletto",
                "name_fr": "Escarpins Stiletto en Cuir Verni Noir 85mm",
                "name_ar": "حذاء كعب ستيليتو من الجلد اللامع 85 مم",
                "short_desc_fr": "Cambrure ergonomique et brillance miroir d'exception.",
                "short_desc_ar": "انحناء مريح ولمعان كالمرآة لأناقة لا مثيل لها.",
                "description_fr": "Le soulier de soirée absolu. Conçu avec une semelle intérieure rembourrée de micro-gel pour un confort de marche remarquable lors de vos réceptions.",
                "description_ar": "حذاء المناسبات الأول. مزود بنعل داخلي محشو بطبقة جل مريحة لتوفير أقصى درجات الراحة طوال السهرة.",
                "base_price": Decimal("1850.00"),
                "discount_price": None,
                "universe": GenderUniverse.WOMEN,
                "cat_slug": "femme-chaussures",
                "is_featured": False,
                "is_new": True,
                "images": [
                    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?q=80&w=1000&auto=format&fit=crop"
                ],
                "variants": [
                    {"size": "37", "color_name_fr": "Noir Miroir", "color_name_ar": "أسود مرآتي", "color_code": "#0A0A0A", "stock": 9},
                    {"size": "38", "color_name_fr": "Noir Miroir", "color_name_ar": "أسود مرآتي", "color_code": "#0A0A0A", "stock": 12},
                    {"size": "39", "color_name_fr": "Noir Miroir", "color_name_ar": "أسود مرآتي", "color_code": "#0A0A0A", "stock": 7},
                    {"size": "38", "color_name_fr": "Rouge Carmin", "color_name_ar": "أحمر قرمزي", "color_code": "#960018", "stock": 6},
                ]
            }
        ]

        for p_data in products_data:
            existing_p = db.query(Product).filter(Product.sku == p_data["sku"]).first()
            if not existing_p:
                category = cat_map[p_data["cat_slug"]]
                product = Product(
                    sku=p_data["sku"],
                    slug=p_data["slug"],
                    name_fr=p_data["name_fr"],
                    name_ar=p_data["name_ar"],
                    short_desc_fr=p_data["short_desc_fr"],
                    short_desc_ar=p_data["short_desc_ar"],
                    description_fr=p_data["description_fr"],
                    description_ar=p_data["description_ar"],
                    base_price=p_data["base_price"],
                    discount_price=p_data["discount_price"],
                    universe=p_data["universe"],
                    category_id=category.id,
                    is_featured=p_data["is_featured"],
                    is_new=p_data["is_new"],
                    is_active=True
                )
                db.add(product)
                db.flush()

                # Images
                for idx, img_url in enumerate(p_data["images"]):
                    img = ProductImage(
                        product_id=product.id,
                        url=img_url,
                        alt_text_fr=f"{product.name_fr} vue {idx + 1}",
                        alt_text_ar=f"{product.name_ar} منظر {idx + 1}",
                        is_cover=(idx == 0),
                        sort_order=idx
                    )
                    db.add(img)

                # Variantes et stock initial
                for v_data in p_data["variants"]:
                    var_sku = f"{product.sku}-{v_data['size']}-{v_data['color_code'].replace('#', '')}"
                    variant = ProductVariant(
                        product_id=product.id,
                        sku=var_sku,
                        size=v_data["size"],
                        color_name_fr=v_data["color_name_fr"],
                        color_name_ar=v_data["color_name_ar"],
                        color_code=v_data["color_code"],
                        stock=v_data["stock"],
                        is_active=True
                    )
                    db.add(variant)
                    db.flush()

                    # Mouvement d'inventaire initial
                    mvt = InventoryMovement(
                        variant_id=variant.id,
                        quantity=v_data["stock"],
                        reason=InventoryReason.RESTOCK,
                        reference="Stock initial ouverture"
                    )
                    db.add(mvt)

        # 4. Campagnes publicitaires et bannières
        campaigns_data = [
            {
                "title_fr": "L'Élégance Intemporelle",
                "title_ar": "الأناقة الخالدة",
                "subtitle_fr": "Nouvelle collection Homme & Femme confectionnée dans les plus nobles matières.",
                "subtitle_ar": "تشكيلة جديدة للرجال والنساء مصممة من أنبل وأرقى الخامات العالمية.",
                "button_text_fr": "Explorer la collection",
                "button_text_ar": "استكشف التشكيلة",
                "link_url": "/homme",
                "desktop_image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop",
                "mobile_image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
                "target_universe": GenderUniverse.UNISEX,
                "sort_order": 1,
                "is_active": True
            },
            {
                "title_fr": "L'Allure Masculine Moderne",
                "title_ar": "الجاذبية الرجالية العصرية",
                "subtitle_fr": "Costumes sur mesure, souliers patinés et maroquinerie haut de gamme.",
                "subtitle_ar": "بدلات راقية، أحذية معتقة وجلود فاخرة لإطلالة تفرض حضورك.",
                "button_text_fr": "Découvrir l'univers Homme",
                "button_text_ar": "اكتشف عالم الرجال",
                "link_url": "/homme",
                "desktop_image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop",
                "mobile_image": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
                "target_universe": GenderUniverse.MEN,
                "sort_order": 2,
                "is_active": True
            },
            {
                "title_fr": "Grâce & Haute Couture Féminine",
                "title_ar": "الرقة والأناقة النسائية الرفيعة",
                "subtitle_fr": "Robes de soie, tailleurs impeccables et sacs à main d'exception.",
                "subtitle_ar": "فساتين حريرية، بدلات متقنة وحقائب يد تليق بجمالك.",
                "button_text_fr": "Découvrir l'univers Femme",
                "button_text_ar": "اكتشف عالم النساء",
                "link_url": "/femme",
                "desktop_image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop",
                "mobile_image": "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop",
                "target_universe": GenderUniverse.WOMEN,
                "sort_order": 3,
                "is_active": True
            }
        ]

        for camp_d in campaigns_data:
            existing_c = db.query(Campaign).filter(Campaign.title_fr == camp_d["title_fr"]).first()
            if not existing_c:
                c = Campaign(**camp_d)
                db.add(c)

        # 5. Promotions
        promos_data = [
            {
                "code": "BIENVENUE10",
                "name_fr": "Offre de Bienvenue 10%",
                "name_ar": "عرض الترحيب 10%",
                "discount_type": DiscountType.PERCENTAGE,
                "discount_value": Decimal("10.00"),
                "min_order_amount": Decimal("400.00"),
                "is_active": True
            },
            {
                "code": "AVELOR100",
                "name_fr": "Privilège 100 MAD",
                "name_ar": "امتياز 100 درهم",
                "discount_type": DiscountType.FIXED,
                "discount_value": Decimal("100.00"),
                "min_order_amount": Decimal("1200.00"),
                "is_active": True
            }
        ]

        for p_d in promos_data:
            existing_promo = db.query(Promotion).filter(Promotion.code == p_d["code"]).first()
            if not existing_promo:
                pr = Promotion(**p_d)
                db.add(pr)

        db.commit()
        print(">> [SEED SUCCESS] Base de données AVELOR initialisée avec succès !")
    except Exception as e:
        db.rollback()
        print(f">> [SEED ERROR] Erreur lors de l'initialisation : {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
