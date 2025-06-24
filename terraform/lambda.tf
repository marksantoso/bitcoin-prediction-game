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

