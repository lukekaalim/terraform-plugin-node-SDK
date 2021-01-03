terraform {
  required_providers {
    cats = {
      source = "local/example/cats"
      version = "1.0.0"
    }
  }
}

provider "cats" {
  directory = "./cats_data"
}

resource "cats_cat" "MrMeow" {
  nickname = "mr meow"
  color = "brown"
}
resource "cats_cat" "SirSmoochies" {
  nickname = "sir smoochies"
  color = "black"
}
resource "cats_cat" "DamianTheCat" {
  nickname = "damian"
  color = "cream"
}
