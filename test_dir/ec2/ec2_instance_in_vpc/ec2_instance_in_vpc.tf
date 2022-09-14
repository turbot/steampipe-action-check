
data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  // filter {
  //   name   = "virtualization-type"
  //   values = ["hvm"]
  // }
  owners = ["099720144477"] # Canonical
}

resource "aws_instance" "rajweb2" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.medium"
  ebs_optimized = true
  monitoring    = true

  root_block_device {
    delete_on_termination = true
    volume_size           = 10
    volume_type           = "gp2"
  }

  tags = {
    Name = "RajHelloWorld"
  }
}
