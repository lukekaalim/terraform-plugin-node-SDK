resource "example_server" "my-server" {
  address = "1.2.3.4"
}

provider "aws" {
  version = "~> 2.0"
  region  = "us-east-1"
}