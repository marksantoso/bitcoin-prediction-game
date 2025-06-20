# Lambda function for make-guess API
resource "aws_lambda_function" "make_guess" {
  filename         = "make-guess.zip"
  function_name    = "${var.project_name}-make-guess"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      ACTIVE_GUESSES_TABLE = aws_dynamodb_table.active_guesses.name
    }
  }

  tags = {
    Name = "${var.project_name}-make-guess"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_dynamodb_attachment,
    aws_cloudwatch_log_group.make_guess_lambda_logs,
  ]
}

# Lambda function for active-guess API (GET)
resource "aws_lambda_function" "active_guess" {
  filename         = "active-guess.zip"
  function_name    = "${var.project_name}-active-guess"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      ACTIVE_GUESSES_TABLE = aws_dynamodb_table.active_guesses.name
    }
  }

  tags = {
    Name = "${var.project_name}-active-guess"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_dynamodb_attachment,
    aws_cloudwatch_log_group.active_guess_lambda_logs,
  ]
}

# Lambda function for score API (GET)
resource "aws_lambda_function" "score" {
  filename         = "score.zip"
  function_name    = "${var.project_name}-score"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      USER_SCORES_TABLE = aws_dynamodb_table.user_scores.name
    }
  }

  tags = {
    Name = "${var.project_name}-score"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_dynamodb_attachment,
    aws_cloudwatch_log_group.score_lambda_logs,
  ]
}

# Lambda function for btc-price API (GET)
resource "aws_lambda_function" "btc_price" {
  filename         = "btc-price.zip"
  function_name    = "${var.project_name}-btc-price"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  tags = {
    Name = "${var.project_name}-btc-price"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_cloudwatch_log_group.btc_price_lambda_logs,
  ]
}

# Lambda function for resolve-guess API (POST)
resource "aws_lambda_function" "resolve_guess" {
  filename         = "resolve-guess.zip"
  function_name    = "${var.project_name}-resolve-guess"
  role            = aws_iam_role.lambda_execution_role.arn
  handler         = "index.handler"
  runtime         = var.lambda_runtime
  timeout         = var.lambda_timeout
  memory_size     = var.lambda_memory_size

  environment {
    variables = {
      ACTIVE_GUESSES_TABLE = aws_dynamodb_table.active_guesses.name
      USER_SCORES_TABLE = aws_dynamodb_table.user_scores.name
    }
  }

  tags = {
    Name = "${var.project_name}-resolve-guess"
    Environment = var.environment
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic_execution,
    aws_iam_role_policy_attachment.lambda_dynamodb_attachment,
    aws_cloudwatch_log_group.resolve_guess_lambda_logs,
  ]
}

# CloudWatch Log Groups for Lambda functions
resource "aws_cloudwatch_log_group" "make_guess_lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-make-guess"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-make-guess-lambda-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "active_guess_lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-active-guess"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-active-guess-lambda-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "score_lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-score"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-score-lambda-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "btc_price_lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-btc-price"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-btc-price-lambda-logs"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "resolve_guess_lambda_logs" {
  name              = "/aws/lambda/${var.project_name}-resolve-guess"
  retention_in_days = 14

  tags = {
    Name = "${var.project_name}-resolve-guess-lambda-logs"
    Environment = var.environment
  }
}

# API Gateway REST API
resource "aws_api_gateway_rest_api" "bitcoin_api" {
  name        = "${var.project_name}-api"
  description = "Bitcoin Price Guess API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${var.project_name}-api"
    Environment = var.environment
  }
}

# API Gateway resource for /v1
resource "aws_api_gateway_resource" "api_v1" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  parent_id   = aws_api_gateway_rest_api.bitcoin_api.root_resource_id
  path_part   = "v1"
}

# ===== MAKE GUESS ENDPOINT =====
resource "aws_api_gateway_resource" "make_guess" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  parent_id   = aws_api_gateway_resource.api_v1.id
  path_part   = "make-guess"
}

resource "aws_api_gateway_method" "make_guess_post" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.make_guess.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "make_guess_options" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.make_guess.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "make_guess_integration" {
  rest_api_id             = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id             = aws_api_gateway_resource.make_guess.id
  http_method             = aws_api_gateway_method.make_guess_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.make_guess.invoke_arn
}

resource "aws_api_gateway_integration" "make_guess_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.make_guess.id
  http_method = aws_api_gateway_method.make_guess_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# ===== ACTIVE GUESS ENDPOINT =====
resource "aws_api_gateway_resource" "active_guess" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  parent_id   = aws_api_gateway_resource.api_v1.id
  path_part   = "active-guess"
}

resource "aws_api_gateway_method" "active_guess_get" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.active_guess.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.querystring.userId" = true
  }
}

resource "aws_api_gateway_method" "active_guess_options" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.active_guess.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "active_guess_integration" {
  rest_api_id             = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id             = aws_api_gateway_resource.active_guess.id
  http_method             = aws_api_gateway_method.active_guess_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.active_guess.invoke_arn
}

resource "aws_api_gateway_integration" "active_guess_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.active_guess.id
  http_method = aws_api_gateway_method.active_guess_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# ===== SCORE ENDPOINT =====
resource "aws_api_gateway_resource" "score" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  parent_id   = aws_api_gateway_resource.api_v1.id
  path_part   = "score"
}

resource "aws_api_gateway_method" "score_get" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.score.id
  http_method   = "GET"
  authorization = "NONE"

  request_parameters = {
    "method.request.querystring.userId" = true
  }
}

resource "aws_api_gateway_method" "score_options" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.score.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "score_integration" {
  rest_api_id             = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id             = aws_api_gateway_resource.score.id
  http_method             = aws_api_gateway_method.score_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.score.invoke_arn
}

resource "aws_api_gateway_integration" "score_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.score.id
  http_method = aws_api_gateway_method.score_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# ===== BTC PRICE ENDPOINT =====
resource "aws_api_gateway_resource" "btc_price" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  parent_id   = aws_api_gateway_resource.api_v1.id
  path_part   = "btc-price"
}

resource "aws_api_gateway_method" "btc_price_get" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.btc_price.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "btc_price_options" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.btc_price.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "btc_price_integration" {
  rest_api_id             = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id             = aws_api_gateway_resource.btc_price.id
  http_method             = aws_api_gateway_method.btc_price_get.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.btc_price.invoke_arn
}

resource "aws_api_gateway_integration" "btc_price_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.btc_price.id
  http_method = aws_api_gateway_method.btc_price_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# ===== RESOLVE GUESS ENDPOINT =====
resource "aws_api_gateway_resource" "resolve_guess" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  parent_id   = aws_api_gateway_resource.api_v1.id
  path_part   = "resolve-guess"
}

resource "aws_api_gateway_method" "resolve_guess_post" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.resolve_guess.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_method" "resolve_guess_options" {
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id   = aws_api_gateway_resource.resolve_guess.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "resolve_guess_integration" {
  rest_api_id             = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id             = aws_api_gateway_resource.resolve_guess.id
  http_method             = aws_api_gateway_method.resolve_guess_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.resolve_guess.invoke_arn
}

resource "aws_api_gateway_integration" "resolve_guess_options_integration" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.resolve_guess.id
  http_method = aws_api_gateway_method.resolve_guess_options.http_method
  type        = "MOCK"

  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

# Method responses for all endpoints
resource "aws_api_gateway_method_response" "make_guess_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.make_guess.id
  http_method = aws_api_gateway_method.make_guess_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "make_guess_options_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.make_guess.id
  http_method = aws_api_gateway_method.make_guess_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "active_guess_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.active_guess.id
  http_method = aws_api_gateway_method.active_guess_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "active_guess_options_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.active_guess.id
  http_method = aws_api_gateway_method.active_guess_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "score_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.score.id
  http_method = aws_api_gateway_method.score_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "score_options_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.score.id
  http_method = aws_api_gateway_method.score_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "btc_price_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.btc_price.id
  http_method = aws_api_gateway_method.btc_price_get.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "btc_price_options_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.btc_price.id
  http_method = aws_api_gateway_method.btc_price_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "resolve_guess_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.resolve_guess.id
  http_method = aws_api_gateway_method.resolve_guess_post.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

resource "aws_api_gateway_method_response" "resolve_guess_options_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.resolve_guess.id
  http_method = aws_api_gateway_method.resolve_guess_options.http_method
  status_code = "200"

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = true
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
  }
}

# Integration responses
resource "aws_api_gateway_integration_response" "make_guess_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.make_guess.id
  http_method = aws_api_gateway_method.make_guess_post.http_method
  status_code = aws_api_gateway_method_response.make_guess_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.make_guess_integration]
}

resource "aws_api_gateway_integration_response" "make_guess_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.make_guess.id
  http_method = aws_api_gateway_method.make_guess_options.http_method
  status_code = aws_api_gateway_method_response.make_guess_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST,GET'"
  }

  depends_on = [aws_api_gateway_integration.make_guess_options_integration]
}

resource "aws_api_gateway_integration_response" "active_guess_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.active_guess.id
  http_method = aws_api_gateway_method.active_guess_get.http_method
  status_code = aws_api_gateway_method_response.active_guess_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.active_guess_integration]
}

resource "aws_api_gateway_integration_response" "active_guess_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.active_guess.id
  http_method = aws_api_gateway_method.active_guess_options.http_method
  status_code = aws_api_gateway_method_response.active_guess_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST,GET'"
  }
  
  depends_on = [aws_api_gateway_integration.active_guess_options_integration]
}

resource "aws_api_gateway_integration_response" "score_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.score.id
  http_method = aws_api_gateway_method.score_get.http_method
  status_code = aws_api_gateway_method_response.score_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
  
  depends_on = [aws_api_gateway_integration.score_integration]
}

resource "aws_api_gateway_integration_response" "score_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.score.id
  http_method = aws_api_gateway_method.score_options.http_method
  status_code = aws_api_gateway_method_response.score_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST,GET'"
  }
  
  depends_on = [aws_api_gateway_integration.score_options_integration]
}

resource "aws_api_gateway_integration_response" "btc_price_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.btc_price.id
  http_method = aws_api_gateway_method.btc_price_get.http_method
  status_code = aws_api_gateway_method_response.btc_price_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
  
  depends_on = [aws_api_gateway_integration.btc_price_integration]
}

resource "aws_api_gateway_integration_response" "btc_price_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.btc_price.id
  http_method = aws_api_gateway_method.btc_price_options.http_method
  status_code = aws_api_gateway_method_response.btc_price_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST,GET'"
  }

  depends_on = [aws_api_gateway_integration.btc_price_options_integration]
}

resource "aws_api_gateway_integration_response" "resolve_guess_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.resolve_guess.id
  http_method = aws_api_gateway_method.resolve_guess_post.http_method
  status_code = aws_api_gateway_method_response.resolve_guess_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }

  depends_on = [aws_api_gateway_integration.resolve_guess_integration]
}

resource "aws_api_gateway_integration_response" "resolve_guess_options_integration_response" {
  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id
  resource_id = aws_api_gateway_resource.resolve_guess.id
  http_method = aws_api_gateway_method.resolve_guess_options.http_method
  status_code = aws_api_gateway_method_response.resolve_guess_options_response.status_code

  response_parameters = {
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST,GET'"
  }

  depends_on = [aws_api_gateway_integration.resolve_guess_options_integration]
}

# API Gateway deployment
resource "aws_api_gateway_deployment" "bitcoin_api_deployment" {
  depends_on = [
    aws_api_gateway_integration.make_guess_integration,
    aws_api_gateway_integration.active_guess_integration,
    aws_api_gateway_integration.score_integration,
    aws_api_gateway_integration.btc_price_integration,
    aws_api_gateway_integration.resolve_guess_integration,
    aws_api_gateway_integration.make_guess_options_integration,
    aws_api_gateway_integration.active_guess_options_integration,
    aws_api_gateway_integration.score_options_integration,
    aws_api_gateway_integration.btc_price_options_integration,
    aws_api_gateway_integration.resolve_guess_options_integration,
    aws_api_gateway_integration_response.make_guess_integration_response,
    aws_api_gateway_integration_response.active_guess_integration_response,
    aws_api_gateway_integration_response.score_integration_response,
    aws_api_gateway_integration_response.btc_price_integration_response,
    aws_api_gateway_integration_response.resolve_guess_integration_response,
    aws_api_gateway_integration_response.make_guess_options_integration_response,
    aws_api_gateway_integration_response.active_guess_options_integration_response,
    aws_api_gateway_integration_response.score_options_integration_response,
    aws_api_gateway_integration_response.btc_price_options_integration_response,
    aws_api_gateway_integration_response.resolve_guess_options_integration_response,
  ]

  rest_api_id = aws_api_gateway_rest_api.bitcoin_api.id

  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_resource.api_v1.id,
      aws_api_gateway_resource.make_guess.id,
      aws_api_gateway_resource.active_guess.id,
      aws_api_gateway_resource.score.id,
      aws_api_gateway_resource.btc_price.id,
      aws_api_gateway_resource.resolve_guess.id,
      aws_api_gateway_method.make_guess_post.id,
      aws_api_gateway_method.active_guess_get.id,
      aws_api_gateway_method.score_get.id,
      aws_api_gateway_method.btc_price_get.id,
      aws_api_gateway_method.resolve_guess_post.id,
      aws_api_gateway_method.make_guess_options.id,
      aws_api_gateway_method.active_guess_options.id,
      aws_api_gateway_method.score_options.id,
      aws_api_gateway_method.btc_price_options.id,
      aws_api_gateway_method.resolve_guess_options.id,
      aws_api_gateway_integration.make_guess_integration.id,
      aws_api_gateway_integration.active_guess_integration.id,
      aws_api_gateway_integration.score_integration.id,
      aws_api_gateway_integration.btc_price_integration.id,
      aws_api_gateway_integration.resolve_guess_integration.id,
      aws_api_gateway_integration.make_guess_options_integration.id,
      aws_api_gateway_integration.active_guess_options_integration.id,
      aws_api_gateway_integration.score_options_integration.id,
      aws_api_gateway_integration.btc_price_options_integration.id,
      aws_api_gateway_integration.resolve_guess_options_integration.id,
      timestamp(),
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway stage - replaces deprecated stage_name parameter
resource "aws_api_gateway_stage" "bitcoin_api_stage" {
  deployment_id = aws_api_gateway_deployment.bitcoin_api_deployment.id
  rest_api_id   = aws_api_gateway_rest_api.bitcoin_api.id
  stage_name    = var.api_stage_name

  tags = {
    Name = "${var.project_name}-api-stage"
  }
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "make_guess_api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway-MakeGuess"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.make_guess.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.bitcoin_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "active_guess_api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway-ActiveGuess"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.active_guess.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.bitcoin_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "score_api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway-Score"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.score.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.bitcoin_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "btc_price_api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway-BtcPrice"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.btc_price.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.bitcoin_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "resolve_guess_api_gateway_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway-ResolveGuess"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.resolve_guess.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.bitcoin_api.execution_arn}/*/*"
} 