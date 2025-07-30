#!/bin/bash
set -euo pipefail

# Basic deployment script for the Decoded infrastructure
STACK_NAME=${STACK_NAME:-decoded-stack}
TEMPLATE_FILE=${TEMPLATE_FILE:-cloudformation/template.yaml}
S3_BUCKET=${S3_BUCKET:-decoded-deploy-bucket}
REGION=${AWS_REGION:-eu-central-1}

build_artifacts() {
  echo "Building artifacts..."
  # Add project build commands here (e.g., npm run build)
}

package_template() {
  echo "Packaging CloudFormation template..."
  aws cloudformation package \
    --template-file "$TEMPLATE_FILE" \
    --s3-bucket "$S3_BUCKET" \
    --output-template-file packaged.yaml \
    --region "$REGION"
}

deploy_stack() {
  echo "Deploying CloudFormation stack $STACK_NAME..."
  aws cloudformation deploy \
    --template-file packaged.yaml \
    --stack-name "$STACK_NAME" \
    --capabilities CAPABILITY_NAMED_IAM \
    --region "$REGION"
}

main() {
  build_artifacts
  package_template
  deploy_stack
}

main "$@"
