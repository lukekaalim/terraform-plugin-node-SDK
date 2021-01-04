terraform {
  required_providers {
    example = {
      source = "local/example/example"
      version = "1.0.0"
    }
  }
}

resource "example_resource" "instance" {
  name = "example_resource_name ;)"
}

output "resource_id" {
  value = example_resource.instance.id
}