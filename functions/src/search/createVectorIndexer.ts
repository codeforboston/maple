import { runWith, Change } from "firebase-functions";
import * as admin from "firebase-admin";
import { PredictionServiceClient, helpers } from "@google-cloud/aiplatform";
import hash from "object-hash";

export interface VectorIndexerConfig {
  documentTrigger: string;
  textFields: string[]; // Fields to combine for the embedding
  vectorField: string; // Destination field for the embedding (e.g., 'vector_embedding')
}

export function createVectorIndexer(config: VectorIndexerConfig) {
  const location = "us-central1";
  const publisher = "google";
  const model = "text-embedding-004";
  
  return runWith({
    timeoutSeconds: 60,
    memory: "512MB",
    secrets: ["GOOGLE_APPLICATION_CREDENTIALS"] // If needed, though usually automatic on GCP
  })
    .firestore.document(config.documentTrigger)
    .onWrite(async (change) => {
      const data = change.after.exists ? change.after.data() : null;
      if (!data) return; // Deleted

      // Extract text to embed
      const textToEmbed = config.textFields
        .map(field => {
          const parts = field.split(".");
          let val: any = data;
          for (const part of parts) val = val?.[part];
          return val;
        })
        .filter(Boolean)
        .join("\n\n");

      if (!textToEmbed) return;

      // Check if text has changed to avoid redundant API calls
      const textHash = hash(textToEmbed);
      const previousData = change.before.exists ? change.before.data() : null;
      const previousText = previousData ? config.textFields
        .map(field => {
          const parts = field.split(".");
          let val: any = previousData;
          for (const part of parts) val = val?.[part];
          return val;
        })
        .filter(Boolean)
        .join("\n\n") : null;
      
      const previousHash = previousText ? hash(previousText) : null;
      
      if (textHash === previousHash && data[config.vectorField]) {
        return; // Nothing changed
      }

      // Initialize Vertex AI client
      const project = admin.app().options.projectId;
      const endpoint = `projects/${project}/locations/${location}/publishers/${publisher}/models/${model}`;
      const client = new PredictionServiceClient({
        apiEndpoint: `${location}-aiplatform.googleapis.com`,
      });

      // Get embedding
      const instance = helpers.toValue({ content: textToEmbed });
      const [response] = await client.predict({
        endpoint,
        instances: [instance],
      });
      
      const prediction = helpers.fromValue(response.predictions![0] as any);
      const embedding = (prediction as any).embeddings.values;

      // Update document
      await change.after.ref.update({
        [config.vectorField]: embedding,
        [`${config.vectorField}_hash`]: textHash // Store hash to track changes
      });
    });
}
