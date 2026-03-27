#!/bin/bash

DB_USER="webuser"
DB_PASS="Password123!"
DB_NAME="app_db"
WEB_SERVER="192.168.100.11"   # IP de VM2 (DMZ)
API_URL="http://$WEB_SERVER/api/articles"

# Récupérer tous les articles au format JSON
# Utilisation de mysql avec option --raw pour éviter les caractères d'échappement
JSON=$(mysql -u "$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -se "
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'id', id,
            'title', title,
            'content', content,
            'created_at', created_at
        )
    ) FROM articles;
" 2>/dev/null)

# Vérifier si le JSON est non vide et valide
if [[ "$JSON" != "null" && -n "$JSON" ]]; then
    # Envoyer au serveur web
    curl -X POST -H "Content-Type: application/json" -d "{\"articles\":$JSON}" "$API_URL" >/dev/null 2>&1
    echo "$(date): Envoi réussi - $(echo "$JSON") articles" >> /var/log/push_articles.log
else
    echo "$(date): Erreur lors de la récupération des articles" >> /var/log/push_articles.log
fi
