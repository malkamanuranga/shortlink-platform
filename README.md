<h1 align="center">🔗 Shortlink Platform</h1>
<p align="center">A URL shortener API with a full CI/CD pipeline: tests, scans, container publishing and Kubernetes packaging</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white" alt="Helm">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes">
  <img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins">
  <img src="https://img.shields.io/badge/ArgoCD-EF7B4D?style=for-the-badge&logo=argo&logoColor=white" alt="ArgoCD">
  <img src="https://img.shields.io/badge/Trivy-1904DA?style=for-the-badge&logo=aquasecurity&logoColor=white" alt="Trivy">
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions">
</p>

---

## 🎯 What it is

`POST /links` turns a long web address into a short code. `GET /:code` redirects to the original address. The service is small on purpose, so the focus is the **delivery pipeline**: every change is tested, scanned, packaged and ready to deploy.

## 📊 Status

| Area | Status | Evidence |
|---|---|---|
| API with validation (only http and https allowed) | ✅ Done | 5 Jest tests in `tests/app.test.js` |
| Multi-stage, non-root Docker image with healthcheck | ✅ Built | `Dockerfile` |
| Hardened Compose (read-only FS, dropped capabilities) | ✅ Written | `docker-compose.yml` |
| CI: lint, test, build | ✅ Done | `ci.yml` workflow |
| Security: npm audit and Trivy filesystem scan | ✅ Done | `security.yml` workflow |
| Publish to GHCR after an image scan | ⏳ Verify in Actions | `publish.yml` workflow |
| Helm chart with HPA, PDB, probes and ingress | ✅ Written | `helm lint` and `helm template` |
| Jenkins pipeline with approval gate | ⏳ Written | Not run on a Jenkins server |
| ArgoCD application | ⏳ Written | Not applied to a cluster |

## 🏗️ Architecture

```mermaid
flowchart LR
  User["User"] -->|"POST /links"| API["Express API"]
  User -->|"GET /code"| API
  API --> Store["In-memory store"]

  Push["git push"] --> CI["ci.yml: lint, test, docker build"]
  Push --> Sec["security.yml: npm audit, Trivy fs scan"]
  Push --> Pub["publish.yml: build, Trivy image scan, push"]
  Pub --> GHCR["GHCR image"]

  GHCR --> Helm["Helm chart: charts/shortlink"]
  Helm --> K8s["Kubernetes: Deployment, Service, HPA, PDB, Ingress"]
  Argo["ArgoCD Application"] -->|"syncs"| Helm
  Jenkins["Jenkinsfile"] -->|"alternative pipeline"| GHCR
```

## 🔁 Pipeline, step by step

1. **Push to `main`.** Three workflows start in parallel: `ci`, `security` and `publish`.
2. **`ci.yml`** installs packages, runs ESLint and Jest on Node 20 and 22, then builds the Docker image.
3. **`security.yml`** runs `npm audit` for production packages and a Trivy scan of the repository.
4. **`publish.yml`** builds the image, scans it with Trivy, and only then logs in and pushes it to GHCR. A vulnerable image never reaches the registry.
5. **Deploy** uses the Helm chart, either through ArgoCD (GitOps) or the Jenkinsfile (approval gate, then `helm upgrade --install`).

## 🧩 Repository structure

```text
shortlink-platform/
├── src/
│   ├── app.js                 routes, validation, redirects, metrics-free store
│   └── server.js              starts the server, handles SIGTERM for clean shutdown
├── tests/app.test.js          5 Jest tests: health, create, redirect, bad input, unknown code
├── Dockerfile                 multi-stage build, non-root user, healthcheck
├── .dockerignore              keeps secrets and junk out of the image
├── docker-compose.yml         local run with a read-only filesystem and resource limits
├── charts/shortlink/          Helm chart: Chart.yaml, values, templates
├── Jenkinsfile                pipeline: lint, test, build, scan, push, approve, deploy
├── deploy/argocd/             ArgoCD Application
├── .github/workflows/         ci.yml, security.yml, publish.yml
└── .github/dependabot.yml     automatic dependency update pull requests



## 🚀 Run it locally

```bash
npm ci
npm test
docker build -t shortlink:local .
docker run --rm -p 3000:3000 shortlink:local

curl -X POST http://localhost:3000/links -H "Content-Type: application/json" -d '{"url":"https://example.com"}'
curl -i http://localhost:3000/<code-from-above>
```

## ⚠️ Known gaps

- Links are stored in memory and are lost when the app restarts. A real deployment needs a database.
- Nothing has been run on a Jenkins server or an ArgoCD instance yet.
- No authentication on link creation.

## 🧠 Key decisions

- **Build and scan before publishing:** a failing scan stops the push. See `publish.yml`.
- **Non-root, read-only containers:** a compromised app has less room to cause damage.
- **Helm labels from one helper:** a Service selector can't drift from the Deployment labels.
- **Graceful shutdown:** SIGTERM finishes in-flight requests before the process exits.

## 👤 Author

**Malka Manuranga**, BSc (Hons) Software Engineering, NSBM Green University
[LinkedIn](https://linkedin.com/in/malka-manuranga) · [GitHub](https://github.com/malkamanuranga)
'@

git add README.md
git commit -m "docs: add project readme with pipeline and file guide"
git push
- **Graceful shutdown:** SIGTERM finishes in-flight requests before the process exits.

## 👤 Author

**Malka Manuranga**, BSc (Hons) Software Engineering, NSBM Green University
[LinkedIn](https://linkedin.com/in/malka-manuranga) · [GitHub](https://github.com/malkamanuranga)
