# MedVault Production Deployment Guide (GKE Autopilot)

This document details the production architecture, build pipelines, and Kubernetes deployment workflows for MedVault on Google Kubernetes Engine (GKE) Autopilot.

---

## 1. Architecture Overview

```
                          Internet / Users
                                 │
                                 ▼
                     GCE Ingress (External HTTP(S) LB)
                    [kubernetes.io/ingress.class: "gce"]
                                 │
                 ┌───────────────┴───────────────┐
                 │ Path: /                       │ Path: /api
                 ▼                               ▼
       Frontend Service (ClusterIP:80)   Backend Service (ClusterIP:8080)
       NEG: cloud.google.com/neg         NEG: cloud.google.com/neg
       Target: Port 80                   BackendConfig: backend-config
                 │                               │
                 ▼                               ▼
      Frontend Pods (2 replicas)        Backend Pods (2 replicas)
      Nginx SPA (Port 80)               FastAPI / Uvicorn (Port 8080)
      Probes: /                         Probes: /health
```

- **Cluster:** GKE Autopilot (`medvault-cluster`), Region: `asia-south1`, Project: `medvault-511505`.
- **Artifact Registry:** `asia-south1-docker.pkg.dev/medvault-511505/medvault-repo/{backend,frontend}:latest`.
- **Ingress & Routing:** A single external IP handles all client traffic via Google Cloud HTTP(S) Load Balancer.
  - `/` &rarr; Frontend Service (Nginx serving React SPA, 2 replicas).
  - `/api` &rarr; Backend Service (FastAPI running on port 8080, 2 replicas).
- **Container-Native Load Balancing (NEG):** Both services use container-native NEGs (`cloud.google.com/neg: '{"ingress": true}'`), enabling the Cloud Load Balancer to route directly to Pod IPs.
- **BackendConfig:** Backend service attaches `BackendConfig` to configure GCP Load Balancer health checks on `/health` at port 8080.
- **Same-Origin API Communication:** The frontend communicates with `/api` using relative paths on the same origin (no cross-origin CORS handling required).

---

## 2. Secrets Management

> [!IMPORTANT]
> This repository is public. Never commit real credentials or `.env` files. `k8s/secret.example.yaml` is only a reference template.

Create the Kubernetes Secret directly in your cluster via `kubectl` before applying workloads:

```bash
kubectl create secret generic medvault-secrets \
  --from-literal=OPENAI_API_KEY='YOUR_OPENAI_API_KEY' \
  --from-literal=GROQ_API_KEY='YOUR_GROQ_API_KEY' \
  --from-literal=RESEND_API_KEY='YOUR_RESEND_API_KEY' \
  --from-literal=FIREBASE_STORAGE_BUCKET='your-project.firebasestorage.app' \
  --from-literal=SMTP_SERVER='smtp.gmail.com' \
  --from-literal=SMTP_PORT='587' \
  --from-literal=SMTP_USER='your_email@gmail.com' \
  --from-literal=SMTP_PASS='your_gmail_app_password' \
  --from-literal=MAIL_FROM_EMAIL='your_email@gmail.com' \
  --from-literal=MAIL_FROM_NAME='MediVault' \
  --from-literal=FRONTEND_URL='http://localhost' \
  --from-file=FIREBASE_CREDENTIALS_JSON=./firebase-service-account.json \
  --dry-run=client -o yaml | kubectl apply -f -
```

---

## 3. Image Build & Push (Cloud Build)

Run all commands from the repository root (`~/medVault`):

### Build and Push Backend
```bash
gcloud builds submit ./backend \
  --tag asia-south1-docker.pkg.dev/medvault-511505/medvault-repo/backend:latest
```

### Build and Push Frontend
The frontend uses `cloudbuild-frontend.yaml` to pass the build argument `VITE_API_URL=/api`:
```bash
gcloud builds submit --config=cloudbuild-frontend.yaml .
```

---

## 4. Kubernetes Manifest Apply Sequence

Apply the manifests in the following exact order. Do **NOT** use `kubectl apply -f k8s/` to avoid applying `secret.example.yaml`:

```bash
# 1. Apply BackendConfig CRD first so GCP health check rules exist
kubectl apply -f k8s/backendconfig.yaml

# 2. Apply Services with NEG and BackendConfig annotations
kubectl apply -f k8s/service.yaml

# 3. Apply Deployments (reads medvault-secrets, launches 2 replicas each)
kubectl apply -f k8s/deployment.yaml

# 4. Apply Ingress (provisions GCE Load Balancer with / and /api rules)
kubectl apply -f k8s/ingress.yaml
```

---

## 5. Rollout & Verification

### Restart workloads to pick up freshly built images
```bash
kubectl rollout restart deployment/backend
kubectl rollout restart deployment/frontend
```

### Check Rollout and Pod Status
```bash
kubectl rollout status deployment/backend
kubectl rollout status deployment/frontend
kubectl get pods -o wide
```

### Check Services & Ingress Status
```bash
kubectl get svc
kubectl get ingress medvault-ingress -w
```

### End-to-End Curl Verification
Once `ADDRESS` is assigned on `medvault-ingress` (usually 5–8 minutes for GCP Load Balancer provisioning):

```bash
INGRESS_IP=$(kubectl get ingress medvault-ingress -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "External Ingress IP: ${INGRESS_IP}"

# 1. Verify Frontend (returns HTTP 200 and HTML)
curl -s -o /dev/null -w "%{http_code}\n" http://${INGRESS_IP}/

# 2. Verify Backend health through Ingress /api route (returns HTTP 200 and JSON)
curl -s http://${INGRESS_IP}/api/health
```

---

## 6. Troubleshooting

- **ImagePullBackOff / ErrImagePull:**
  Verify GKE Autopilot service account has `Artifact Registry Reader` permissions on `medvault-repo`:
  ```bash
  kubectl describe pod -l app=backend
  kubectl describe pod -l app=frontend
  ```

- **CrashLoopBackOff:**
  Check application logs for missing secret keys or database connection errors:
  ```bash
  kubectl logs -l app=backend --tail=100
  kubectl logs -l app=frontend --tail=100
  kubectl get secret medvault-secrets
  ```

- **502 Bad Gateway / Backend Unhealthy:**
  Google Cloud Load Balancer takes several minutes to mark backends healthy. Inspect BackendConfig and NEG status:
  ```bash
  kubectl describe ingress medvault-ingress
  kubectl describe backendconfig backend-config
  kubectl get svc backend -o yaml
  ```

---

## 7. Teardown

To cleanly remove all deployed Kubernetes resources and release the Google Cloud Load Balancer:

```bash
# Delete ingress (releases GCP external IP and forwarding rules)
kubectl delete -f k8s/ingress.yaml

# Delete deployments
kubectl delete -f k8s/deployment.yaml

# Delete services and backendconfig
kubectl delete -f k8s/service.yaml
kubectl delete -f k8s/backendconfig.yaml

# (Optional) Delete secrets
kubectl delete secret medvault-secrets
```
