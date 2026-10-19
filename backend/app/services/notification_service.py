import re
from urllib.parse import quote
from typing import Optional, Dict, Any

class NotificationService:
    """
    Service de gestion des notifications SMS & WhatsApp pour la Maison AVELOR.
    Supporte le formatage marocain (+212 / 06 / 07 / 05), la génération de liens
    WhatsApp officiels et les templates de messages automatisés.
    """

    @staticmethod
    def normalize_moroccan_phone(phone: str) -> str:
        """Nettoie et formate un numéro de téléphone marocain en format international sans préfixe '+'."""
        cleaned = re.sub(r"[^\d+]", "", str(phone or "")).strip()
        if cleaned.startswith("+"):
            cleaned = cleaned[1:]
        elif cleaned.startswith("0") and len(cleaned) == 10:
            cleaned = "212" + cleaned[1:]
        elif not cleaned.startswith("212") and len(cleaned) == 9:
            cleaned = "212" + cleaned
        return cleaned

    @classmethod
    def generate_whatsapp_link(cls, phone: str, message: str) -> str:
        """Génère un lien direct d'ouverture WhatsApp (Web ou Mobile) avec message pré-rempli."""
        clean_phone = cls.normalize_moroccan_phone(phone)
        encoded_message = quote(message.strip())
        return f"https://wa.me/{clean_phone}?text={encoded_message}"

    @classmethod
    def get_order_confirmation_message(
        cls,
        customer_name: str,
        order_number: str,
        total_amount: str,
        city: str,
        payment_method: str = "CASH_ON_DELIVERY"
    ) -> str:
        """Message de confirmation envoyé au client lors de sa commande."""
        payment_text = "Paiement à la livraison" if payment_method == "CASH_ON_DELIVERY" else "Payé par Carte Bancaire (CMI)"
        return (
            f"✨ *Maison AVELOR · Confirmation de Commande*\n\n"
            f"Bonjour Cher(e) *{customer_name}*,\n\n"
            f"Nous avons l'honneur de vous confirmer la prise en charge de votre commande *{order_number}*.\n\n"
            f"📦 *Détails de l'expédition :*\n"
            f"• Montant total : *{total_amount} MAD*\n"
            f"• Règlement : {payment_text}\n"
            f"• Destination : {city}\n\n"
            f"Nos artisans préparent minutieusement votre colis dans nos ateliers. Vous recevrez prochainement votre numéro de suivi Amana Express.\n\n"
            f"Merci pour votre confiance en l'élégance AVELOR.\n"
            f"📞 Service Conciergerie : https://avelor.ma"
        )

    @classmethod
    def get_order_shipped_message(
        cls,
        customer_name: str,
        order_number: str,
        tracking_number: str,
        carrier_name: str = "Amana Express Maroc"
    ) -> str:
        """Message d'avis d'expédition avec lien de suivi transporteur."""
        tracking_link = f"http://www.amana-colis.ma/suivi.php?code={tracking_number}" if tracking_number else "http://www.amana-colis.ma"
        return (
            f"🚚 *Maison AVELOR · Expédition de votre commande*\n\n"
            f"Bonjour *{customer_name}*,\n\n"
            f"Votre commande *{order_number}* vient d'être confiée à notre transporteur partenaire *{carrier_name}*.\n\n"
            f"📍 *Suivi de livraison en temps réel :*\n"
            f"• N° de suivi (Tracking) : *{tracking_number}*\n"
            f"• Suivre mon colis : {tracking_link}\n\n"
            f"La livraison s'effectuera à l'adresse indiquée sous 24h à 48h ouvrables. Le livreur vous contactera par téléphone avant son passage.\n\n"
            f"L'équipe AVELOR reste à votre entière disposition."
        )

    @classmethod
    def get_client_to_concierge_message(
        cls,
        customer_name: str,
        order_number: str,
        total_amount: str,
        city: str
    ) -> str:
        """Message pré-rédigé lorsque le client clique sur 'Confirmer sur WhatsApp' après son achat."""
        return (
            f"Bonjour AVELOR Conciergerie,\n\n"
            f"Je viens de valider ma commande sur votre boutique en ligne :\n"
            f"• Numéro : {order_number}\n"
            f"• Nom : {customer_name}\n"
            f"• Ville : {city}\n"
            f"• Total : {total_amount} MAD\n\n"
            f"Je souhaite confirmer ma commande et être informé(e) dès son expédition par Amana. Merci !"
        )
