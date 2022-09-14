// select
//   -- Required Columns
//   arn as resource,
//   case
//     when vpc_id is null then 'alarm'
//     else 'ok'
//   end as status,
//   case
//     when vpc_id is null then title || ' not in VPC.'
//     else title || ' in VPC.'
//   end as reason,
//   -- Additional Dimensions
//   region,
//   account_id
// from
//   aws_ec2_instance;

// This is base min query with VPC association

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  owners = ["099720109477"] # Canonical
}

// CREATE VPC
resource "aws_vpc" "tf_my_vpc" {
  cidr_block = "172.16.0.0/16"
}

resource "aws_subnet" "tf_subnet" {
  vpc_id            = aws_vpc.tf_my_vpc.id
  cidr_block        = "172.16.10.0/24"
  availability_zone = "us-west-2a"
  tags = {
    Name = "tf-example"
  }
}

resource "aws_network_interface" "tf_foo" {
  subnet_id   = aws_subnet.tf_subnet.id
  private_ips = ["172.16.10.100"]
}

//ASSOCIATE INSTANCE
resource "aws_instance" "tf_rajweb2" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"

  network_interface {
    network_interface_id = aws_network_interface.tf_foo.id
    device_index         = 0
  }
}
