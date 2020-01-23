
const admin = require("firebase-admin");

const inputCreds = require(process.env.INPUT_CREDS);
const inputDatabase = admin.initializeApp({credential: admin.credential.cert(inputCreds)}).firestore();
const inputCollection = process.env.INPUT_COLLECTION;

const outputCreds = require(process.env.OUTPUT_CREDS);
const outputAppName = process.env.OUTPUT_APP_NAME;
const outputDatabase = admin.initializeApp({credential: admin.credential.cert(outputCreds)}, outputAppName).firestore();
const outputCollection = process.env.OUTPUT_COLLECTION;

const batchGet = (repo, collection) => {
    return repo.collection(collection).get().then(querySnap => {
        console.log(`Found ${querySnap.docs.length} documents`);
        return querySnap.docs.reduce((mappedDoc, doc) => {
             return Object.assign({}, mappedDoc, {
                 [doc.id] : {
                     id: doc.id,
                    data: doc.data()
                 }
            })
        }, {})
    });
};

const batchWrite = (docs, repo, collection) => {
    let batch = repo.batch();
    docs.forEach(doc => {
        const ref = repo.collection(collection).doc(doc.id);
        batch.set(ref, doc.data)
    });
    console.log(`Inserting ${docs.length} documents`);
    return batch.commit();
};

const reconciliate = (inputRepo, outputRepo, inputCollection, outputCollection) => {
    return inputRepo.collection(inputCollection).get().then(inputSnap => {
        return outputRepo.collection(outputCollection).get().then(outputSnap => {
            const inputCount = inputSnap.docs.length;
            const outputCount = outputSnap.docs.length;
            console.log(`reconciliate => Found ${inputCount} in input collection`);
            console.log(`reconciliate => Found ${outputCount} in output collection`);
            console.log(`reconciliate => Do amount of docs match? => ${inputCount === outputCount ? "YES" : "NO"}`)
        })
    });
};

const chunk = (array, size) => {
    const chunked_arr = [];
    let copied = [...array];
    const numOfChild = Math.ceil(copied.length / size);
    for (let i = 0; i < numOfChild; i++) {
        chunked_arr.push(copied.splice(0, size));
    }
    return chunked_arr;
};

return batchGet(inputDatabase, inputCollection).then(docMap => {
    const docArr = Object.values(docMap);
    const chunkedArr = chunk(docArr, 10);

    return Promise.all(chunkedArr.map(chunk => {
        return batchWrite(chunk, outputDatabase, outputCollection);
    })).then(() => {
        return reconciliate(inputDatabase, outputDatabase, inputCollection, outputCollection);
    });
});
