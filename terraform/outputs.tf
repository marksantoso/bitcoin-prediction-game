# API Gateway URLs
output "api_gateway_base_url" {
  description = "Base URL of the API Gateway"
  value       = "https://${aws_api_gateway_rest_api.bitcoin_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.bitcoin_api_stage.stage_name}/api"
}

output "make_guess_endpoint" {
  description = "URL for the make-guess endpoint"
  value       = "https://${aws_api_gateway_rest_api.bitcoin_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.bitcoin_api_stage.stage_name}/api/make-guess"
}

output "active_guess_endpoint" {
  description = "URL for the active-guess endpoint"
  value       = "https://${aws_api_gateway_rest_api.bitcoin_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.bitcoin_api_stage.stage_name}/api/active-guess"
}

output "score_endpoint" {
  description = "URL for the score endpoint"
  value       = "https://${aws_api_gateway_rest_api.bitcoin_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.bitcoin_api_stage.stage_name}/api/score"
}

output "btc_price_endpoint" {
  description = "URL for the btc-price endpoint"
  value       = "https://${aws_api_gateway_rest_api.bitcoin_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.bitcoin_api_stage.stage_name}/api/btc-price"
}

output "resolve_guess_endpoint" {
  description = "URL for the resolve-guess endpoint"
  value       = "https://${aws_api_gateway_rest_api.bitcoin_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.bitcoin_api_stage.stage_name}/api/resolve-guess"
}

# API Gateway ID
output "api_gateway_id" {
  description = "ID of the API Gateway"
  value       = aws_api_gateway_rest_api.bitcoin_api.id
}

# Lambda Functions
output "make_guess_lambda_name" {
  description = "Name of the make-guess Lambda function"
  value       = aws_lambda_function.make_guess.function_name
}

output "active_guess_lambda_name" {
  description = "Name of the active-guess Lambda function"
  value       = aws_lambda_function.active_guess.function_name
}

output "score_lambda_name" {
  description = "Name of the score Lambda function"
  value       = aws_lambda_function.score.function_name
}

output "btc_price_lambda_name" {
  description = "Name of the btc-price Lambda function"
  value       = aws_lambda_function.btc_price.function_name
}

output "resolve_guess_lambda_name" {
  description = "Name of the resolve-guess Lambda function"
  value       = aws_lambda_function.resolve_guess.function_name
}

# DynamoDB Tables
output "dynamodb_active_guesses_table_name" {
  description = "Name of the DynamoDB table for active guesses"
  value       = aws_dynamodb_table.active_guesses.name
}

output "dynamodb_user_scores_table_name" {
  description = "Name of the DynamoDB table for user scores"
  value       = aws_dynamodb_table.user_scores.name
}

# CloudWatch Log Groups
output "make_guess_log_group_name" {
  description = "Name of the CloudWatch log group for make-guess Lambda"
  value       = aws_cloudwatch_log_group.make_guess_lambda_logs.name
}

output "active_guess_log_group_name" {
  description = "Name of the CloudWatch log group for active-guess Lambda"
  value       = aws_cloudwatch_log_group.active_guess_lambda_logs.name
}

output "score_log_group_name" {
  description = "Name of the CloudWatch log group for score Lambda"
  value       = aws_cloudwatch_log_group.score_lambda_logs.name
}

output "btc_price_log_group_name" {
  description = "Name of the CloudWatch log group for btc-price Lambda"
  value       = aws_cloudwatch_log_group.btc_price_lambda_logs.name
}

output "resolve_guess_log_group_name" {
  description = "Name of the CloudWatch log group for resolve-guess Lambda"
  value       = aws_cloudwatch_log_group.resolve_guess_lambda_logs.name
}

# IAM Role
output "iam_role_arn" {
  description = "ARN of the IAM role for Lambda"
  value       = aws_iam_role.lambda_execution_role.arn
}