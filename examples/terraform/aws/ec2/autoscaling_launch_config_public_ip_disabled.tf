# Create AWS > EC2 > Volume
resource "aws_ebs_volume" "my_volume" {
  availability_zone = "us-east-1a"
  size              = 1
  type              = "standard"
  tags = {
    Name = "turbot-volume-test"
  }
}

# Create AWS > EC2 > Snapshot
resource "aws_ebs_snapshot" "my_snapshot" {
  volume_id = aws_ebs_volume.my_volume.id
  tags = {
    Name = "turbot-snapshot-test"
  }
}

# Create AWS > EC2 > AMI
resource "aws_ami" "named_test_resource" {
  name                = "test"
  virtualization_type = "hvm"
  root_device_name    = "/dev/sda1"
  ebs_block_device {
    device_name = "/dev/sda1"
    snapshot_id = aws_ebs_snapshot.my_snapshot.id
    volume_size = 1
  }
  tags = {
    name = "test"
  }
}

# Create AWS > EC2 > Launch Configuration
resource "aws_launch_configuration" "named_test_resource" {
  name                        = "test"
  image_id                    = aws_ami.named_test_resource.id
  instance_type               = "t2.nano"
  associate_public_ip_address = true
}
