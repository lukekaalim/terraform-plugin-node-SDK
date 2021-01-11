
terraform {
  required_providers {
    cattery = {
      source = "local/example/cattery"
      version = "0.1.0"
    }
  }
}

provider "cattery" {
  cattery_path = "./cattery"
}

resource "cattery_cat" "smiggles" {
  nickname = "Mr Smiggles"
  color = "Light Brown"
}

resource "cattery_cat" "jenkins" {
  nickname = "Old Man Jenkins"
  color = "Black"
}