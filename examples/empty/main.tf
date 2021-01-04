
terraform {
  required_providers {
    empty = {
      source = "local/example/empty"
      version = "0.1.0"
    }
  }
}

resource "empty_resource" "my_example_resource" {}
  