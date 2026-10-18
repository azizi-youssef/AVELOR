import sys
from sqlalchemy import text
from app.core.database import engine, db_url

def test_connection():
    print("=" * 65)
    print("TEST DE CONNEXION SUPABASE POSTGRESQL - AVELOR")
    print("=" * 65)
    
    masked_url = db_url
    if "@" in masked_url:
        prefix, rest = masked_url.split("@", 1)
        if ":" in prefix:
            scheme_user = prefix.rsplit(":", 1)[0]
            masked_url = f"{scheme_user}:******@{rest}"
            
    print(f">> Cible : {masked_url}")
    
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1;")).scalar()
            version = conn.execute(text("SELECT version();")).scalar()
            print(">> [SUCCÈS] Connexion PostgreSQL établie avec succès !")
            print(f">> Serveur : {version[:60]}...")
            print(">> Votre base Supabase est prête pour AVELOR.")
    except Exception as e:
        print("\n>> [ERREUR DE CONNEXION SUPABASE] :")
        print(e)
        print("\nVérifications :")
        print("1. Avez-vous remplacé [PROJECT_REF] et [PASSWORD] dans 'backend/.env' ?")
        print("2. Assurez-vous que le mot de passe de votre base Supabase est correct.")
        print("3. Si votre mot de passe contient des caractères spéciaux, encodez-les en URL.")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
