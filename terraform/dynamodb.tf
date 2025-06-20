# DynamoDB table for storing active guesses
resource "aws_dynamodb_table" "active_guesses" {
  name           = "${var.project_name}-active-guesses"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  # TTL attribute for automatic cleanup of expired guesses
  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }

  tags = {
    Name = "${var.project_name}-active-guesses"
    Environment = var.environment
  }
}

# DynamoDB table for storing user scores
resource "aws_dynamodb_table" "user_scores" {
  name           = "${var.project_name}-user-scores"
  billing_mode   = var.dynamodb_billing_mode
  hash_key       = "userId"

  attribute {
    name = "userId"
    type = "S"
  }

  tags = {
    Name = "${var.project_name}-user-scores"
    Environment = var.environment
  }
} 