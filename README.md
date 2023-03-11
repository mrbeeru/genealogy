# genealogy

appsettings.json file (test)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017"
  },
  "Urls": "https://*:10010",
  "Kestrel": {
    "Certificates": {
      "Default": {
        "Path": "path to fullchain.pem",
        "KeyPath": "path to privkey.pem"
      }
    }
  }
}
```
