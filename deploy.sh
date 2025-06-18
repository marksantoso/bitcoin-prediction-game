#!/bin/bash

set -e

echo "🚀 Starting deployment of Bitcoin Guess API to AWS..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform is not installed. Please install it first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

# Create terraform directory if it doesn't exist
mkdir -p terraform

# Create deployment directory if it doesn't exist
mkdir -p lambda-packages

echo "📦 Packaging Lambda functions..."

# Function to package a Lambda function
package_lambda() {
    local source_file=$1
    local function_name=$2
    local dependencies=$3
    
    if [ -f "lambda/$source_file" ]; then
        echo "Packaging $function_name Lambda function..."
        cd lambda
        
        # Create temporary package directory
        mkdir -p temp-$function_name
        cp $source_file temp-$function_name/make-guess.js
        cp config.js temp-$function_name/ # Include shared config
        
        # Create or copy package.json with dependencies
        if [ -f "package.json" ] && [ "$function_name" = "make-guess" ]; then
            cp package.json temp-$function_name/
        else
            echo "$dependencies" > temp-$function_name/package.json
        fi
        
        cd temp-$function_name
        npm install --production 2>/dev/null || echo "No dependencies to install for $function_name"
        zip -r ../../terraform/$function_name.zip . 2>/dev/null
        cd ..
        rm -rf temp-$function_name
        cd ..
        echo "✓ $function_name packaged (includes config.js)"
    fi
}

# Package make-guess function (special case - uses existing structure)
if [ -f "lambda/make-guess.js" ]; then
    echo "Packaging make-guess Lambda function..."
    cd lambda
    npm install --production 2>/dev/null || echo "No package.json found for make-guess, using existing dependencies"
    # Include config.js in the package
    zip -r ../terraform/make-guess.zip . -x "*.git*" "node_modules/.bin/*" "temp-*" "build-lambdas.sh" 2>/dev/null
    cd ..
    echo "✓ make-guess packaged (includes config.js)"
fi

# Package all other Lambda functions using the reusable function
package_lambda "active-guess.js" "active-guess" '{"dependencies":{"@aws-sdk/client-dynamodb":"^3.0.0","@aws-sdk/lib-dynamodb":"^3.0.0"}}'
package_lambda "score.js" "score" '{"dependencies":{"@aws-sdk/client-dynamodb":"^3.0.0","@aws-sdk/lib-dynamodb":"^3.0.0"}}'
package_lambda "btc-price.js" "btc-price" '{"dependencies":{}}'
package_lambda "resolve-guess.js" "resolve-guess" '{"dependencies":{"@aws-sdk/client-dynamodb":"^3.0.0","@aws-sdk/lib-dynamodb":"^3.0.0"}}'

echo "✅ All Lambda functions packaged successfully!"
echo "📝 Note: All packages now include the shared config.js file"

# Navigate to terraform directory
cd terraform

# Check if terraform.tfvars exists, if not copy from example
if [ ! -f "terraform.tfvars" ]; then
    echo "📋 Creating terraform.tfvars from example..."
    cp terraform.tfvars.example terraform.tfvars
    echo "⚠️  Please review and update terraform.tfvars with your desired values"
fi

# Initialize Terraform
echo "🔧 Initializing Terraform..."
terraform init

# Validate Terraform configuration
echo "✅ Validating Terraform configuration..."
terraform validate

# Plan the deployment
echo "📋 Planning Terraform deployment..."
terraform plan

# Ask for confirmation before applying
read -p "Do you want to apply these changes? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Applying Terraform configuration..."
    terraform apply -auto-approve
    
    echo ""
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "📊 Outputs:"
    terraform output
    
    echo ""
    echo "🎉 Your Bitcoin Guess API is now deployed to AWS!"
    echo "Use the API Gateway URL above to test your endpoint."
else
    echo "❌ Deployment cancelled."
fi 