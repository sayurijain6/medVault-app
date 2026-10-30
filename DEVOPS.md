# MedVault DevOps: Jenkins + SonarQube + Docker + Kubernetes

MedVault runs entirely on your own containers. No Vercel or Render needed.

```
 GitHub ──► Jenkins ──► pytest + vite build ──► SonarQube (quality gate)
                │
                ├──► docker build (backend, frontend) ──► Trivy scan ──► (optional) push to registry
                │
                └──► kubectl apply -k  ──► Kubernetes namespace "medvault"
                                              ├─ backend  (FastAPI, HPA 1–5 pods)
                                              ├─ frontend (nginx, proxies /api → backend)
                                              └─ Ingress  (/ → frontend, /api → backend)
```

## What is in the repo

| Path | Purpose |
|------|---------|
| `Jenkinsfile` | Pipeline: tests → SonarQube → Docker build → Trivy → push → deploy → smoke test |
| `sonar-project.properties` | SonarQube project settings (sources, coverage report) |
| `ci/docker-compose.yml` | Runs Jenkins, SonarQube and its Postgres database |
| `ci/jenkins/` | Jenkins image (docker CLI, kubectl, Python, Node, sonar-scanner) and its config-as-code |
| `k8s/base/` | Namespace, Deployments, Services, Ingress, HPA |
| `k8s/overlays/local/` | Docker Desktop / minikube / kind (1 replica, ingress-nginx) |
| `k8s/overlays/gke/` | Google Kubernetes Engine (GCE Ingress, NEGs, BackendConfig) |
| `docker-compose.yml` | Run the app alone without Kubernetes |
| `backend/tests/` | API tests run by the pipeline (coverage goes to SonarQube) |

## Requirements

- Docker Desktop (Windows/Mac) or Docker Engine (Linux), with **8 GB RAM** given to Docker
- A Kubernetes cluster. Easiest: Docker Desktop → Settings → Kubernetes → **Enable Kubernetes**
- `kubectl` (comes with Docker Desktop)

## 1. Quick run without Kubernetes

```bash
docker compose up --build
```

Open http://localhost:3000. Put server secrets in `backend/.env` (see `backend/env.example`).

## 2. Prepare Kubernetes (once)

Install the ingress controller:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml
```

Create the namespace and the backend secrets (Firebase service-account JSON from Firebase → Project settings → Service accounts → Generate new private key):

```bash
kubectl create namespace medvault
kubectl -n medvault create secret generic medvault-secrets \
  --from-literal=GROQ_API_KEY='YOUR_GROQ_KEY' \
  --from-literal=OPENAI_API_KEY='YOUR_OPENAI_KEY' \
  --from-literal=FIREBASE_STORAGE_BUCKET='medvault-6f6c2.firebasestorage.app' \
  --from-literal=FRONTEND_URL='http://localhost' \
  --from-file=FIREBASE_CREDENTIALS_JSON=./firebase-service-account.json
```

The backend still starts without this secret, but Firestore, uploads and AI features stay off.

## 3. Start Jenkins and SonarQube

```bash
cd ci
docker compose up -d --build
```

- Jenkins: http://localhost:8080 (user `admin`, password `admin`; set `JENKINS_ADMIN_PASSWORD` to change it)
- SonarQube: http://localhost:9000 (user `admin`, password `admin`; it asks for a new one)

Linux only: SonarQube needs `sudo sysctl -w vm.max_map_count=524288` on the host.

## 4. Connect them (once)

1. **SonarQube token:** SonarQube → My Account → Security → Generate Token (type *Global Analysis*). Copy it.
2. **Jenkins credentials:** Jenkins → Manage Jenkins → Credentials → (global) → Add Credentials:
   - Kind *Secret text*, ID `sonarqube-token`, Secret = the token.
   - Kind *Secret file*, ID `kubeconfig`, File = your kubeconfig (`%USERPROFILE%\.kube\config` on Windows, `~/.kube/config` on Mac/Linux).
   - Only if you push images: kind *Username with password*, ID `registry-creds`.

Docker Desktop note: the kubeconfig server is `https://kubernetes.docker.internal:6443`, which also works from inside the Jenkins container.

## 5. Run the pipeline

Jenkins → **medvault** job (created automatically) → **Build with Parameters**:

| Parameter | Local cluster | GKE |
|-----------|---------------|-----|
| `K8S_OVERLAY` | `local` | `gke` |
| `REGISTRY` | *(empty: images stay in local Docker)* | e.g. `asia-south1-docker.pkg.dev/PROJECT/medvault-repo` |
| `DEPLOY` | ✔ | ✔ |

The job also polls GitHub every 5 minutes and builds new commits by itself.

When it is green, open http://localhost (local) or the Ingress IP (`kubectl -n medvault get ingress`).

## Pipeline stages

1. **Checkout**: tag = `<build number>-<git sha>`
2. **Test & Build** (parallel): `pytest` with coverage, `npm ci && npm run build`
3. **SonarQube analysis**: fails the build if the Quality Gate fails
4. **Docker build** (parallel): backend and frontend images
5. **Trivy image scan**: HIGH/CRITICAL CVEs, archived as build artifacts (report only)
6. **Push images**: only when `REGISTRY` is set
7. **Deploy to Kubernetes**: `kubectl apply -k` with this build's tags, waits for rollout
8. **Smoke test**: checks `/health` in the backend pod and `/healthz` in the frontend pod

## Useful commands

```bash
kubectl -n medvault get pods,svc,ingress,hpa
kubectl -n medvault logs -l app=backend --tail=100
kubectl -n medvault rollout undo deployment/backend    # roll back
kubectl delete namespace medvault                      # remove everything
cd ci && docker compose down                           # stop Jenkins + SonarQube (keeps data)
```
