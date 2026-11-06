pipeline {
  agent any

  options {
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '20'))
  }

  environment {
    IMAGE = 'ghcr.io/YOUR_USERNAME/shortlink-platform'
    TAG   = "${env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'local'}"
  }

  stages {
    stage('Install') {
      steps { sh 'npm ci' }
    }

    stage('Quality') {
      parallel {
        stage('Lint') {
          steps { sh 'npm run lint' }
        }
        stage('Test') {
          steps { sh 'npm test' }
        }
      }
    }

    stage('Build image') {
      steps { sh 'docker build -t $IMAGE:$TAG .' }
    }

    stage('Scan image') {
      steps {
        sh 'trivy image --exit-code 1 --severity HIGH,CRITICAL --ignore-unfixed $IMAGE:$TAG'
      }
    }

    stage('Push image') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'ghcr-creds', usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh 'echo "$REG_PASS" | docker login ghcr.io -u "$REG_USER" --password-stdin'
          sh 'docker push $IMAGE:$TAG'
        }
      }
    }

    stage('Approve production') {
      when { branch 'main' }
      steps {
        timeout(time: 15, unit: 'MINUTES') {
          input message: "Deploy ${TAG} to production?"
        }
      }
    }

    stage('Deploy') {
      when { branch 'main' }
      steps {
        withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
          sh '''
            helm upgrade --install shortlink charts/shortlink \
              --namespace shortlink --create-namespace \
              -f charts/shortlink/values-prod.yaml \
              --set image.repository=$IMAGE \
              --set image.tag=$TAG \
              --atomic --timeout 3m
          '''
        }
      }
    }
  }

  post {
    always { sh 'docker image prune -f || true' }
    failure { echo "Build ${env.BUILD_NUMBER} failed" }
  }
}