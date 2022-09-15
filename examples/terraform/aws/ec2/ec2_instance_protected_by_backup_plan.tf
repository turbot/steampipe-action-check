
// Create instance
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  owners = ["123456789123"] # Canonical
}

resource "aws_instance" "tf_rajweb2" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"

  tags = {
    Name = "HelloWorld"
  }
}
// This is separate resource in steampipe terraform_resources
resource "aws_backup_vault" "tf_backup_vault_example" {
  name = "example_backup_vault"
  // kms_key_arn = aws_kms_key.example.arn
}

resource "aws_backup_plan" "tf_bkp_plan_example" {
  name = "tf_example_backup_plan"

  rule {
    rule_name         = "tf_example_backup_rule"
    target_vault_name = aws_backup_vault.tf_backup_vault_example.id
    schedule          = "cron(0 12 * * ? *)"
  }
  // The advanced_backup_setting does not help to set which service will be enabled for backup from the listed service in settings page
  // This is related the advance setting which is optional (?)
  advanced_backup_setting {
    backup_options = {
      WindowsVSS = "enabled"
    }
    resource_type = "EC2"
  }
}

// Required role for backup service
// Below is creation of role

resource "aws_iam_role" "tf_role_example" {
  name               = "example"
  assume_role_policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": ["sts:AssumeRole"],
      "Effect": "allow",
      "Principal": {
        "Service": ["backup.amazonaws.com"]
      }
    }
  ]
}
POLICY
}

resource "aws_iam_role_policy_attachment" "example" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSBackupServiceRolePolicyForBackup"
  role       = aws_iam_role.tf_role_example.name
}

//Selecting Backups By Resource
// Assigning resource to the backup plan

resource "aws_backup_selection" "tf_resource_example" {
  iam_role_arn = aws_iam_role.tf_role_example.arn
  name         = "tf_example_backup_selection"
  plan_id      = aws_backup_plan.tf_bkp_plan_example.id

  resources = [
    aws_instance.tf_rajweb2.arn
  ]
}
