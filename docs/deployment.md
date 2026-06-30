# 🚀 Aegis Zen Deployment Guide

Aegis Zen is fully containerized using a multi-stage Docker container build. The monorepo setup packages the React production assets and mounts them directly to the Express server instance. This architecture permits hosting the entire service (client and server) as a single running container, making it ideal for cost-efficient and auto-scaling cloud compute platforms.

---

## Container Strategy (Dockerfile)

The deployment relies on a multi-stage [Dockerfile](file:///run/media/oberoi/New%20Volume/Study/Projects/aegis-zen/Dockerfile):

1. **Stage 1: Build Frontend**:
   - Uses `node:20-alpine` base image.
   - Copies frontend package configuration, installs dev-dependencies, and compiles React static resources using Vite (`npm run build`).
   - Output bundle is placed under `/app/frontend/dist`.
2. **Stage 2: Compile Server & Host**:
   - Uses `node:20-alpine` base image.
   - Installs production-only node modules inside `backend/` (`npm ci --prefix backend --only=production`).
   - Copies built assets from Stage 1 (`/app/frontend/dist` ➔ `/frontend/dist`).
   - Binds port listener to the environment variable `PORT` (defaults to `8080`).

---

## Production Routing & Asset Delivery

When running with `NODE_ENV=production`:
- The Node/Express server initializes and mounts middleware to serve the static frontend folder:
  ```javascript
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  ```
- To support React Router single-page mechanics, a wildcard router intercept is implemented. Any non-API request that doesn't start with `/api` or `/health` is automatically redirected to serve `index.html`:
  ```javascript
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
  ```

---

## Local Container Testing

To run the container version locally and verify production builds:

1. **Build the Container Image**:
   ```bash
   docker build -t aegis-zen .
   ```
2. **Launch the Container**:
   Make sure to pass your Google AI Studio API key as an environment variable:
   ```bash
   docker run -p 8080:8080 -e GEMINI_API_KEY=your_gemini_api_key_here aegis-zen
   ```
3. **Verify App status**:
   - Access client UI: `http://localhost:8080`
   - Access health check: `http://localhost:8080/health`

---

## Cloud Deployment (Google Cloud Run)

Aegis Zen is pre-configured and optimized to run on **Google Cloud Run** due to its stateless container design and standard PORT injections.

### Deployment Walkthrough:

#### Option A: Deploying via Google Cloud Shell & CLI
Ensure the Google Cloud CLI (`gcloud`) is installed and configured on your machine.

1. **Submit Build to Google Container Registry**:
   ```bash
   gcloud builds submit --tag gcr.io/your-project-id/aegis-zen
   ```
2. **Deploy to Cloud Run**:
   Run the deployment command, setting target parameters, memory budgets, and the Gemini API key secret:
   ```bash
   gcloud run deploy aegis-zen \
     --image gcr.io/your-project-id/aegis-zen \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY=your_gemini_api_key_here
   ```

#### Option B: Deploying via GitHub Actions (Continuous Integration)
You can automate deployment by pushing the image on master updates. Store the Google Service Account JSON inside GitHub Secrets (`GCP_SA_KEY`) along with the Gemini key (`GEMINI_API_KEY`).

An example Github workflow (`.github/workflows/deploy.yml`):
```yaml
name: Continuous Deployment

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Authenticate Google Cloud
      uses: google-github-actions/auth@v2
      with:
        credentials_json: ${{ secrets.GCP_SA_KEY }}

    - name: Build and Push Docker Image
      run: |
        gcloud auth configure-docker
        docker build -t gcr.io/${{ secrets.GCP_PROJECT }}/aegis-zen:${{ github.sha }} .
        docker push gcr.io/${{ secrets.GCP_PROJECT }}/aegis-zen:${{ github.sha }}

    - name: Deploy to Cloud Run
      run: |
        gcloud run deploy aegis-zen \
          --image gcr.io/${{ secrets.GCP_PROJECT }}/aegis-zen:${{ github.sha }} \
          --region us-central1 \
          --platform managed \
          --allow-unauthenticated \
          --set-env-vars GEMINI_API_KEY=${{ secrets.GEMINI_API_KEY }}
```

---

## Deployment Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | String | Yes | `production` | Set to `production` inside host to run optimized client bundles. |
| `PORT` | Number | No | `8080` (Docker) | Port for the container. Automatically overridden by Google Cloud Run. |
| `GEMINI_API_KEY` | String | Yes | *None* | Your Google AI Studio API Key required to run the planning and analysis features. |
