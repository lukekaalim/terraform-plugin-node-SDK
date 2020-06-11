provider "aws" {
  version = "~> 2.0"
  region  = "us-east-1"
}

provider "example" {
  myAttribute = "helloooo !"
}

resource "example_my_resource" "cool-resource" { 
  myResourceAttribute = ":)"
}

output "attribute" {
  value = example_my_resource.cool-resource.myResourceAttribute
}