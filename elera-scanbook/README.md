# ELERA Scanbook Portal

POS Test Scripts with Scannable Barcodes for Toshiba Global Commerce Solutions.

## Retail Verticals
- **Grocery** - Full-service grocery POS testing with produce, promotions, and loyalty programs
- **Convenience / Fuel** - C-store and fuel station POS scenarios (Coming Soon)
- **Pharmacy** - Pharmacy retail testing with prescription workflows (Coming Soon)

## Test Credentials
- Username: `admin`
- Password: `elera2025`

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Deployment Options

### Option 1: Azure Static Web Apps (Recommended for Simple Deployment)

**Via Azure Portal:**
1. Go to Azure Portal → Create a resource → Static Web App
2. Connect to your GitHub repo
3. Set build settings:
   - App location: `/`
   - Output location: `dist`
   - Build command: `npm run build`
4. Deploy triggers automatically on push to main

**Via Azure CLI:**
```bash
# Login to Azure
az login

# Create resource group (if needed)
az group create --name elera-scanbook-rg --location centralus

# Create Static Web App (connected to GitHub)
az staticwebapp create \
  --name elera-scanbook \
  --resource-group elera-scanbook-rg \
  --source https://github.com/YOUR_USERNAME/elera-scanbook \
  --location centralus \
  --branch main \
  --app-location "/" \
  --output-location "dist" \
  --login-with-github
```

---

### Option 2: Azure App Service (Container)

**Step 1: Build and push to ACR**
```bash
# Login to ACR
az acr login --name YOUR_ACR_NAME

# Build and push
docker build -t elera-scanbook:v1 .
docker tag elera-scanbook:v1 YOUR_ACR_NAME.azurecr.io/elera-scanbook:v1
docker push YOUR_ACR_NAME.azurecr.io/elera-scanbook:v1
```

**Step 2: Create App Service**
```bash
# Create App Service plan
az appservice plan create \
  --name elera-scanbook-plan \
  --resource-group elera-scanbook-rg \
  --is-linux \
  --sku B1

# Create web app from container
az webapp create \
  --name elera-scanbook-app \
  --resource-group elera-scanbook-rg \
  --plan elera-scanbook-plan \
  --deployment-container-image-name YOUR_ACR_NAME.azurecr.io/elera-scanbook:v1

# Configure ACR credentials
az webapp config container set \
  --name elera-scanbook-app \
  --resource-group elera-scanbook-rg \
  --docker-registry-server-url https://YOUR_ACR_NAME.azurecr.io \
  --docker-registry-server-user YOUR_ACR_USERNAME \
  --docker-registry-server-password YOUR_ACR_PASSWORD
```

---

### Option 3: Azure Kubernetes Service (AKS)

**Step 1: Build and push to ACR** (same as Option 2)

**Step 2: Create Kubernetes manifests**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: elera-scanbook
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: elera-scanbook
  template:
    metadata:
      labels:
        app: elera-scanbook
    spec:
      containers:
      - name: elera-scanbook
        image: YOUR_ACR_NAME.azurecr.io/elera-scanbook:v1
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
---
apiVersion: v1
kind: Service
metadata:
  name: elera-scanbook-svc
spec:
  type: ClusterIP
  selector:
    app: elera-scanbook
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: elera-scanbook-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: scanbook.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: elera-scanbook-svc
            port:
              number: 80
```

**Step 3: Deploy to AKS**
```bash
# Get AKS credentials
az aks get-credentials --resource-group YOUR_AKS_RG --name YOUR_AKS_CLUSTER

# Apply manifests
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods -l app=elera-scanbook
kubectl get svc elera-scanbook-svc
kubectl get ingress elera-scanbook-ingress
```

---

### Option 4: Azure Container Apps (Serverless Containers)

```bash
# Create Container Apps environment
az containerapp env create \
  --name elera-scanbook-env \
  --resource-group elera-scanbook-rg \
  --location centralus

# Deploy container app
az containerapp create \
  --name elera-scanbook \
  --resource-group elera-scanbook-rg \
  --environment elera-scanbook-env \
  --image YOUR_ACR_NAME.azurecr.io/elera-scanbook:v1 \
  --target-port 80 \
  --ingress external \
  --registry-server YOUR_ACR_NAME.azurecr.io \
  --registry-username YOUR_ACR_USERNAME \
  --registry-password YOUR_ACR_PASSWORD \
  --cpu 0.25 \
  --memory 0.5Gi
```

---

## Project Structure

```
elera-scanbook/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind CSS
├── public/
│   └── favicon.svg      # App icon
├── .github/
│   └── workflows/
│       └── azure-static-web-apps.yml
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── nginx.conf
└── README.md
```

---

## Adding New Scanbooks

To add Convenience/Fuel or Pharmacy scanbooks:

1. Create data objects similar to `groceryData` in `src/App.jsx`
2. Update the `CategoryCard` components to set `available={true}`
3. Add conditional rendering in `ScanBookView` based on selected category

---

## Version
2.0 - United States Edition 2026
