import { Script } from "./types";
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform";

const location = "us-central1";
const publisher = "google";
const model = "text-embedding-004";

async function getEmbedding(client: PredictionServiceClient, endpoint: string, text: string): Promise<number[]> {
  const instance = helpers.toValue({ content: text });
  const [response] = await client.predict({
    endpoint,
    instances: [instance],
  });
  const prediction = helpers.fromValue(response.predictions![0] as any);
  return (prediction as any).embeddings.values;
}

export const script: Script = async ({ db, firebase, args }) => {
  const project = firebase.app().options.projectId;
  const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;
  const client = new PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`,
  });

  console.log(`Starting backfill for project: ${project}`);

  const collections = [
    { name: "bills", group: true, textFields: ["content.Title", "content.DocumentText"] },
    { name: "publishedTestimony", group: true, textFields: ["content"] },
    { name: "ballotQuestions", group: false, textFields: ["title", "description", "fullSummary"] },
  ];

  for (const col of collections) {
    console.log(`Processing collection: ${col.name}`);
    const ref = col.group ? db.collectionGroup(col.name) : db.collection(col.name);
    const snapshot = await ref.get();
    
    console.log(`Found ${snapshot.size} documents in ${col.name}`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.vector_embedding) {
        console.log(`Skipping ${doc.id} (already indexed)`);
        continue;
      }

      const textToEmbed = col.textFields
        .map(field => {
          const parts = field.split(".");
          let val = data;
          for (const part of parts) val = val?.[part];
          return val;
        })
        .filter(Boolean)
        .join("\n\n");

      if (!textToEmbed) {
        console.log(`Skipping ${doc.id} (no content)`);
        continue;
      }

      try {
        console.log(`Generating embedding for ${doc.id}...`);
        const embedding = await getEmbedding(client, endpoint, textToEmbed);
        await doc.ref.update({ vector_embedding: embedding });
        console.log(`Updated ${doc.id}`);
      } catch (e) {
        console.error(`Failed to index ${doc.id}:`, e);
      }
    }
  }

  console.log("Backfill complete!");
};
