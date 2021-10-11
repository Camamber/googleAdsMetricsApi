1. ```git clone https://github.com/Camamber/googleAdsMetricsApi.git```
1. ```cd googleAdsMetricsApi```
1. ```docker build -t "google-ads-api:latest" .```
1. Run container
```
    docker run -d -p 8080:8080 \
    -e APP_HOST=<127.0.0.1:8080> \
    -e DEVELOPER_TOKEN="<AD_DEVELOPER_TOKEN>" \
    -e CLIENT_ID="<GOOGLE_CLIENT_ID>" \
    -e CLIENT_SECRET="<GOOGLE_CLIENT_SECRET>" \
    -e REFRESH_TOKEN="<GOOGLE_REFRESH_TOKEN>" \
    -e LOGIN_CUSTOMER_ID=<AD_LOIGN_CUSTOMER_ID> \
    -e CUSTOMER_ID=<AD_CUSTOMER_ID> \
     google-ads-api
```