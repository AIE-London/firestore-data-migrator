# firestore-data-migrator

## What is this?
This a simple tool that can migrate data between two cloud firestore instances sitting under different GCP accounts.

## What do I need?
You need four things.

- Service account json for the database providing the data
- Service account json for the database receiving the data
- The name of the collection where the database currently sits
- The name of the collection you want to insert the data into 
- The name of the firebase project you're exporting to

## Where do I get "Service account jsons"?
On the Google Cloud Platform [service account page](https://console.cloud.google.com/projectselector2/iam-admin/serviceaccounts?supportedpurview=project) select or create a new service account. Then go into the account, click edit at the top and click create key at the bottom. Choose json and a file will download.

## Got those, how do I run?

```javascript
git clone git@github.com:Capgemini-AIE/firestore-data-migrator.git

yarn install

INPUT_CREDS="path/to/input/service/acc.json" INPUT_COLLECTION="collection name" OUTPUT_CREDS=".path/to/output/service/acc.json" OUTPUT_COLLECTION="collection" OUTPUT_APP_NAME="name of your second firebase app" node migrator.js
```

## Notes
If your collection a substantial amount of document the migrator will chunk your documents into batches of 10 to prevent errors. 


## Authors
Created by Capgemini AIE London team.