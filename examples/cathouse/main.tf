
terraform {
  required_providers {
    cathouse = {
      source = "local/example/cathouse"
      version = "0.1.0"
    }
  }
}

provider "cathouse" {
  cathousePath = "./cathouse"
}

resource "cathouse_cat" "smiggles" {
  nickname = "Mr Smiggles"
  color = "Light Brown"
}

resource "cathouse_cat" "jenkins" {
  nickname = "Old Man Jenkins"
  color = "Black"
}