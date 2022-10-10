if [ -n "${TYPESENSE_API_KEY}" -a -n "${TYPESENSE_API_URL}" ]; then
    curl "${TYPESENSE_API_URL}/keys" \
        -X POST \
        -H "X-TYPESENSE-API-KEY: ${TYPESENSE_API_KEY}" \
        -H 'Content-Type: application/json' \
        -d '{
                "description":"Search-only key",
                "actions": ["documents:search"], 
                "collections": ["*"]
            }'
else
    echo "Define TYPESENSE_API_KEY and TYPESNSE_API_URL"
fi