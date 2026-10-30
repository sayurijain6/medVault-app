// MedVault CI/CD: test -> SonarQube -> Docker build -> Trivy scan -> (push) -> Kubernetes deploy
//
// Jenkins credentials used (create them in Manage Jenkins -> Credentials):
//   sonarqube-token  Secret text  SonarQube user token
//   kubeconfig       Secret file  kubeconfig for the target cluster
//   registry-creds   Username/password for REGISTRY (only needed when REGISTRY is set)

pipeline {
    agent any

    parameters {
        choice(name: 'K8S_OVERLAY', choices: ['local', 'gke'], description: 'Kubernetes overlay under k8s/overlays')
        string(name: 'REGISTRY', defaultValue: '', description: 'Image registry prefix, e.g. docker.io/myuser. Leave empty to use the local Docker daemon only.')
        booleanParam(name: 'DEPLOY', defaultValue: true, description: 'Deploy to Kubernetes after a successful build')
    }

    environment {
        BACKEND_IMAGE  = "${params.REGISTRY ? params.REGISTRY + '/' : ''}medvault-backend"
        FRONTEND_IMAGE = "${params.REGISTRY ? params.REGISTRY + '/' : ''}medvault-frontend"
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timeout(time: 45, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.IMAGE_TAG = "${env.BUILD_NUMBER}-${sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()}"
                }
                echo "Image tag: ${env.IMAGE_TAG}"
            }
        }

        stage('Test & Build') {
            parallel {
                stage('Backend tests') {
                    steps {
                        // Run from the repo root so coverage.xml paths resolve for SonarQube
                        sh '''
                            python3 -m venv backend/.venv
                            . backend/.venv/bin/activate
                            pip install -q --upgrade pip
                            pip install -q -r backend/requirements-dev.txt
                            PYTHONPATH=backend python -m pytest backend/tests \
                              --cov=backend/app --cov-config=backend/.coveragerc \
                              --cov-report=xml:backend/coverage.xml --junitxml=backend/test-results.xml
                        '''
                    }
                    post {
                        always { junit allowEmptyResults: true, testResults: 'backend/test-results.xml' }
                    }
                }
                stage('Frontend build') {
                    steps {
                        dir('frontend') {
                            sh '''
                                npm ci --no-audit --no-fund
                                VITE_API_URL=/api npm run build
                            '''
                        }
                    }
                }
            }
        }

        stage('SonarQube analysis') {
            steps {
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    // qualitygate.wait makes the scanner fail the build when the Quality Gate fails
                    sh '''
                        sonar-scanner \
                          -Dsonar.host.url="${SONAR_HOST_URL:-http://sonarqube:9000}" \
                          -Dsonar.token="$SONAR_TOKEN" \
                          -Dsonar.projectVersion="$IMAGE_TAG" \
                          -Dsonar.qualitygate.wait=true \
                          -Dsonar.qualitygate.timeout=300
                    '''
                }
            }
        }

        stage('Docker build') {
            parallel {
                stage('Backend image') {
                    steps {
                        sh 'docker build -t "$BACKEND_IMAGE:$IMAGE_TAG" -t "$BACKEND_IMAGE:latest" backend'
                    }
                }
                stage('Frontend image') {
                    steps {
                        sh 'docker build --build-arg VITE_API_URL=/api -t "$FRONTEND_IMAGE:$IMAGE_TAG" -t "$FRONTEND_IMAGE:latest" frontend'
                    }
                }
            }
        }

        stage('Trivy image scan') {
            steps {
                // Report-only: lists HIGH/CRITICAL CVEs without failing the build
                sh '''
                    for img in "$BACKEND_IMAGE:$IMAGE_TAG" "$FRONTEND_IMAGE:$IMAGE_TAG"; do
                      docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v trivy-cache:/root/.cache \
                        aquasec/trivy:0.56.2 image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 0 --no-progress "$img" \
                        | tee "trivy-$(echo "$img" | tr '/:' '__').txt"
                    done
                '''
            }
            post {
                always { archiveArtifacts allowEmptyArchive: true, artifacts: 'trivy-*.txt' }
            }
        }

        stage('Push images') {
            when { expression { params.REGISTRY?.trim() } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'registry-creds', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
                    sh '''
                        echo "$REG_PASS" | docker login "${REGISTRY%%/*}" -u "$REG_USER" --password-stdin
                        for img in "$BACKEND_IMAGE" "$FRONTEND_IMAGE"; do
                          docker push "$img:$IMAGE_TAG"
                          docker push "$img:latest"
                        done
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when { expression { params.DEPLOY } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    // Pin this build's image tags on top of the chosen overlay
                    sh '''
                        rm -rf .deploy && mkdir .deploy
                        cat > .deploy/kustomization.yaml <<EOF
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../k8s/overlays/${K8S_OVERLAY}
images:
  - name: medvault-backend
    newName: ${BACKEND_IMAGE}
    newTag: "${IMAGE_TAG}"
  - name: medvault-frontend
    newName: ${FRONTEND_IMAGE}
    newTag: "${IMAGE_TAG}"
EOF
                        kubectl apply -k .deploy
                        kubectl -n medvault rollout status deployment/backend --timeout=300s
                        kubectl -n medvault rollout status deployment/frontend --timeout=180s
                    '''
                }
            }
        }

        stage('Smoke test') {
            when { expression { params.DEPLOY } }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        kubectl -n medvault exec deploy/backend -- \
                          python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8080/health').read().decode())"
                        kubectl -n medvault exec deploy/frontend -- wget -qO- http://localhost/healthz
                        kubectl -n medvault get pods,svc,ingress,hpa
                    '''
                }
            }
        }
    }

    post {
        success { echo "MedVault ${env.IMAGE_TAG} built${params.DEPLOY ? ' and deployed' : ''}." }
        always  { sh 'rm -rf backend/.venv .deploy' }
    }
}
